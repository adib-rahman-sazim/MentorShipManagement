import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Request } from "express";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { IAbilityContext, ISubjectWithFields } from "@/modules/casl/casl.interfaces";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";
import { parsePermissionString } from "@/utils/permission-string/permission-string.helpers";

@Injectable()
export class CaslPermissionsGuard implements CanActivate {
  private static readonly SYSTEM_ROLES_WITHOUT_ORG_REQUIREMENT = new Set<EUserRole>([
    EUserRole.SUPER_ADMIN,
    EUserRole.MANAGER,
  ]);

  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<IPermissionsOptions | string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    let permissions: string[];
    let requireActiveOrganization = false;

    if (Array.isArray(metadata)) {
      permissions = metadata;
    } else if (metadata && typeof metadata === "object") {
      permissions = metadata.permissions;
      requireActiveOrganization = metadata.requireActiveOrganization ?? false;
    } else {
      return true;
    }

    if (!permissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session;
    const user = request.user;
    const userId = user?.id;

    const normalizedRoles = (user?.roles ?? []) as EUserRole[];
    const effectiveRole = resolveEffectiveRole(normalizedRoles);
    if (!effectiveRole || !userId) {
      throw new ForbiddenException("User role not found");
    }

    const abilityContext: IAbilityContext = {
      userId,
      role: effectiveRole,
      roles: normalizedRoles,
      activeOrganizationId: session?.session?.activeOrganizationId ?? undefined,
    };
    const ability = await this.caslAbilityFactory.createForUser(abilityContext);

    request.ability = ability;

    for (const requiredPerm of permissions) {
      const parsed = parsePermissionString(requiredPerm);
      const action = parsed.action as EPermission;
      const resourceType = parsed.resource as EResource;

      const hasAnyAbility = ability.can(action, resourceType);

      if (!hasAnyAbility && requireActiveOrganization && !session?.session?.activeOrganizationId) {
        if (CaslPermissionsGuard.SYSTEM_ROLES_WITHOUT_ORG_REQUIREMENT.has(effectiveRole)) {
          continue;
        }
        throw new ForbiddenException("No active organization found");
      }

      const subjectContext = this.extractSubjectContext(request, resourceType);

      if (subjectContext) {
        if (!ability.can(action, { ...subjectContext, __caslSubjectType__: resourceType })) {
          throw new ForbiddenException(`You cannot ${action} this ${resourceType}`);
        }
      } else if (!hasAnyAbility) {
        throw new ForbiddenException(`Missing required permission: ${requiredPerm}`);
      }
    }

    return true;
  }

  private extractSubjectContext(
    request: Request,
    resourceType: EResource,
  ): ISubjectWithFields | null {
    if ([EResource.MEMBER, EResource.INVITATION].includes(resourceType)) {
      const organizationId =
        request.params?.organizationId || request.session?.session?.activeOrganizationId;
      return organizationId ? { organizationId: organizationId as string } : null;
    }

    if (resourceType === EResource.ORGANIZATION) {
      const orgId = request.params?.id || request.params?.organizationId;
      return orgId ? { id: orgId as string } : null;
    }

    return null;
  }
}
