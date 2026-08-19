import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import { Permission } from "@/common/entities/permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import { EPermissionConditionType, EResource } from "@/modules/permissions/permissions.enums";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";
import { UserRolesService } from "@/modules/permissions/user-roles.service";

import type { TAppAbility, TAppRawRule } from "./casl.types";
import { CaslCacheService } from "./casl-cache.service";

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly userRolesService: UserRolesService,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async createForUser(context: IAbilityContext): Promise<TAppAbility> {
    const roleCandidates = context.roles ?? (context.role ? [context.role] : []);
    const sortedRoles = roleCandidates.length
      ? roleCandidates
      : await this.userRolesService.getUserRoles(context.userId, context.activeOrganizationId);

    const effectiveRole = resolveEffectiveRole(sortedRoles);
    if (!effectiveRole) {
      const { build } = new AbilityBuilder<TAppAbility>(createMongoAbility);
      return build();
    }

    const cacheKey = this.caslCacheService.buildUserCacheKey(
      context.userId,
      context.activeOrganizationId,
    );
    const cachedRules = await this.caslCacheService.getRules(cacheKey);
    if (cachedRules) {
      return this.buildAbilityFromRules(cachedRules);
    }

    const uniqueRoles = Array.from(new Set(sortedRoles)) as EUserRole[];
    const hydratedPermissions = await this.userRolesService.getPermissionsByRoleSlugs(uniqueRoles);
    const effectivePermissions =
      hydratedPermissions.length > 0
        ? hydratedPermissions
        : this.resolveFallbackPermissionsFromCatalog(uniqueRoles);
    const resolvedRules = this.toResolvedRules(effectivePermissions, context);
    await this.caslCacheService.setRules(cacheKey, resolvedRules);

    return this.buildAbilityFromRules(resolvedRules);
  }

  private buildAbilityFromRules(rules: TAppRawRule[]): TAppAbility {
    const { can, cannot, build } = new AbilityBuilder<TAppAbility>(createMongoAbility);
    const allowedRules = rules.filter((rule) => !rule.inverted);
    const deniedRules = rules.filter((rule) => rule.inverted);

    [...allowedRules, ...deniedRules].forEach((rule) => {
      const action = rule.action;
      const subject = rule.subject;
      if (rule.inverted) {
        if (rule.conditions) {
          cannot(action, subject, rule.conditions);
        } else {
          cannot(action, subject);
        }
        return;
      }

      if (rule.conditions) {
        can(action, subject, rule.conditions);
      } else {
        can(action, subject);
      }
    });

    return build();
  }

  private toResolvedRules(permissions: Permission[], context: IAbilityContext): TAppRawRule[] {
    const deduplicated = new Map<string, TAppRawRule>();

    for (const permission of permissions) {
      const conditions = this.resolveConditions(permission, context);
      if (conditions === undefined && permission.conditionType !== EPermissionConditionType.NONE) {
        continue;
      }

      const subject = permission.resource === EResource.ALL ? "all" : permission.resource;
      const dedupeKey = `${permission.denied}|${permission.action}|${permission.resource}|${JSON.stringify(
        conditions ?? {},
      )}`;

      const rule: TAppRawRule = {
        action: permission.action,
        subject,
        ...(permission.denied ? { inverted: true } : {}),
        ...(conditions ? { conditions } : {}),
      };
      deduplicated.set(dedupeKey, rule);
    }

    return [...deduplicated.values()];
  }

  private resolveConditions(
    permission: Permission,
    context: IAbilityContext,
  ): Record<string, unknown> | undefined {
    switch (permission.conditionType) {
      case EPermissionConditionType.NONE:
        return undefined;
      case EPermissionConditionType.ORGANIZATION_ID:
        return context.activeOrganizationId
          ? { organizationId: context.activeOrganizationId }
          : undefined;
      case EPermissionConditionType.ORGANIZATION_RESOURCE_ID:
        return context.activeOrganizationId ? { id: context.activeOrganizationId } : undefined;
      default:
        return undefined;
    }
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
