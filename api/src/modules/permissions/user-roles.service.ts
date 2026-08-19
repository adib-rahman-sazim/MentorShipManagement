import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { Permission } from "@/common/entities/permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";

import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "./permissions.catalog.constants";
import {
  isOrganizationBoundRole,
  isSystemLevelRole,
  normalizeRolesByPriority,
} from "./permissions.role-priority.helpers";
import { RolePermissionsRepository } from "./role-permissions.repository";
import { RolesRepository } from "./roles.repository";
import { UserRolesRepository } from "./user-roles.repository";

@Injectable()
export class UserRolesService {
  constructor(
    private readonly userRolesRepository: UserRolesRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}

  async getUserRoles(
    userId: string,
    activeOrganizationId?: string | null,
    em?: EntityManager,
  ): Promise<EUserRole[]> {
    const rows = await this.userRolesRepository.withEntityManager(em).find(
      {
        user: { id: userId },
        $or: [
          { organization: null },
          ...(activeOrganizationId ? [{ organization: { id: activeOrganizationId } }] : []),
        ],
      },
      { populate: ["role"] },
    );

    const set = new Set<EUserRole>();
    rows.forEach((row) => {
      const slug = row.role.slug as EUserRole;
      if (Object.values(EUserRole).includes(slug)) {
        if (row.organization == null && isSystemLevelRole(slug)) {
          set.add(slug);
        }
        // Provisional self-serve customer (org-null) used during NOT_ONBOARDED onboarding
        if (row.organization == null && slug === EUserRole.CUSTOMER) {
          set.add(slug);
        }
        if (row.organization != null && isOrganizationBoundRole(slug)) {
          set.add(slug);
        }
      }
    });

    return normalizeRolesByPriority([...set]);
  }

  async removeProvisionalCustomerRole(userId: string, em?: EntityManager): Promise<void> {
    const userRolesRepository = this.userRolesRepository.withEntityManager(em);
    const provisionalRoles = await userRolesRepository.find(
      {
        user: { id: userId },
        organization: null,
        role: { slug: EUserRole.CUSTOMER },
      },
      { populate: ["role"] },
    );

    provisionalRoles.forEach((row) => userRolesRepository.remove(row, em));
    await userRolesRepository.flush(em);
  }

  async getPermissionsByRoleSlugs(
    roleSlugs: EUserRole[],
    em?: EntityManager,
  ): Promise<Permission[]> {
    if (roleSlugs.length === 0) {
      return [];
    }

    const uniqueSlugs = Array.from(new Set(roleSlugs));
    const roleEntities = await this.rolesRepository.withEntityManager(em).find({
      slug: { $in: uniqueSlugs },
    });
    if (roleEntities.length === 0) {
      return this.resolveFallbackPermissionsFromCatalog(uniqueSlugs);
    }

    const rolePermissions = await this.rolePermissionsRepository
      .withEntityManager(em)
      .find(
        { role: { id: { $in: roleEntities.map((role) => role.id) } } },
        { populate: ["permission"] },
      );

    const map = new Map<string, Permission>();
    rolePermissions.forEach((rolePermission) => {
      map.set(rolePermission.permission.code, rolePermission.permission);
    });

    if (map.size === 0) {
      return this.resolveFallbackPermissionsFromCatalog(uniqueSlugs);
    }

    return [...map.values()];
  }

  async updateSystemRoles(
    userId: string,
    roleSlugs: EUserRole[],
    em?: EntityManager,
  ): Promise<EUserRole[]> {
    const userRolesRepository = this.userRolesRepository.withEntityManager(em);
    const rolesRepository = this.rolesRepository.withEntityManager(em);
    const unique = Array.from(new Set(roleSlugs));
    if (unique.some((slug) => !isSystemLevelRole(slug))) {
      throw new BadRequestException(
        "Only system-level roles can be assigned without an organization",
      );
    }

    const existing = await userRolesRepository.find(
      { user: { id: userId }, organization: null },
      { populate: ["role"] },
    );
    existing.forEach((row) => userRolesRepository.remove(row, em));

    if (unique.length > 0) {
      const roles = await rolesRepository.find({ slug: { $in: unique } });
      if (roles.length !== unique.length) {
        throw new NotFoundException("One or more system roles were not found");
      }
      roles.forEach((role) => {
        const userRole = userRolesRepository.create({
          user: userId,
          role,
          organization: null,
        });
        userRolesRepository.persist(userRole, em);
      });
    }

    await userRolesRepository.flush(em);
    return this.getUserRoles(userId, undefined, em);
  }

  async updateMemberRole(
    userId: string,
    organizationId: string,
    roleSlugs: EUserRole[],
    em?: EntityManager,
  ): Promise<EUserRole[]> {
    const userRolesRepository = this.userRolesRepository.withEntityManager(em);
    const rolesRepository = this.rolesRepository.withEntityManager(em);
    const unique = Array.from(new Set(roleSlugs));
    if (unique.some((slug) => !isOrganizationBoundRole(slug))) {
      throw new BadRequestException("Only customer can be assigned as an organization-bound role");
    }

    const existing = await userRolesRepository.find(
      { user: { id: userId }, organization: { id: organizationId } },
      { populate: ["role"] },
    );
    existing.forEach((row) => userRolesRepository.remove(row, em));

    if (unique.length > 0) {
      const roles = await rolesRepository.find({ slug: { $in: unique } });
      if (roles.length !== unique.length) {
        throw new NotFoundException("One or more organization roles were not found");
      }
      roles.forEach((role) => {
        const userRole = userRolesRepository.create({
          user: userId,
          role,
          organization: organizationId,
        });
        userRolesRepository.persist(userRole, em);
      });
    }

    await userRolesRepository.flush(em);
    return this.getUserRoles(userId, organizationId, em);
  }

  private resolveFallbackPermissionsFromCatalog(roleSlugs: EUserRole[]): Permission[] {
    const permittedCodes = new Set<string>();
    roleSlugs.forEach((roleSlug) => {
      (DEFAULT_ROLE_PERMISSION_CODES[roleSlug] ?? []).forEach((code) => {
        permittedCodes.add(code);
      });
    });

    const definitionsByCode = new Map(
      DEFAULT_PERMISSION_DEFINITIONS.map((definition) => [definition.code, definition]),
    );

    return [...permittedCodes]
      .map((code) => definitionsByCode.get(code))
      .filter((definition): definition is NonNullable<typeof definition> => !!definition)
      .map(
        (definition) =>
          ({
            code: definition.code,
            resource: definition.resource,
            action: definition.action,
            conditionType: definition.conditionType,
            denied: definition.denied,
          }) as Permission,
      );
  }
}
