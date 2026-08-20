import { Injectable, NotFoundException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { Permission } from "@/common/entities/permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";

import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "./permissions.catalog.constants";
import { normalizeRolesByPriority } from "./permissions.role-priority.helpers";
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

  async getUserRoles(userId: string, em?: EntityManager): Promise<EUserRole[]> {
    const rows = await this.userRolesRepository
      .withEntityManager(em)
      .find({ user: { id: userId } }, { populate: ["role"] });

    const assignedRoles = new Set<EUserRole>();
    rows.forEach((row) => {
      const slug = row.role.slug as EUserRole;
      if (Object.values(EUserRole).includes(slug)) {
        assignedRoles.add(slug);
      }
    });

    return normalizeRolesByPriority([...assignedRoles]);
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

    const permissionsByCode = new Map<string, Permission>();
    rolePermissions.forEach((rolePermission) => {
      permissionsByCode.set(rolePermission.permission.code, rolePermission.permission);
    });

    if (permissionsByCode.size === 0) {
      return this.resolveFallbackPermissionsFromCatalog(uniqueSlugs);
    }

    return [...permissionsByCode.values()];
  }

  async updateUserRoles(
    userId: string,
    roleSlugs: EUserRole[],
    em?: EntityManager,
  ): Promise<EUserRole[]> {
    const userRolesRepository = this.userRolesRepository.withEntityManager(em);
    const rolesRepository = this.rolesRepository.withEntityManager(em);
    const uniqueSlugs = Array.from(new Set(roleSlugs));

    const existing = await userRolesRepository.find(
      { user: { id: userId } },
      { populate: ["role"] },
    );
    existing.forEach((row) => userRolesRepository.remove(row, em));

    if (uniqueSlugs.length > 0) {
      const roles = await rolesRepository.find({ slug: { $in: uniqueSlugs } });
      if (roles.length !== uniqueSlugs.length) {
        throw new NotFoundException("One or more roles were not found");
      }
      roles.forEach((role) => {
        const userRole = userRolesRepository.create({ user: userId, role });
        userRolesRepository.persist(userRole, em);
      });
    }

    await userRolesRepository.flush(em);
    return this.getUserRoles(userId, em);
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
