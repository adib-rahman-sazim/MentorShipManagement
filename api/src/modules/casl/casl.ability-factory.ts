import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import { Permission } from "@/common/entities/permissions.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import { EResource } from "@/modules/permissions/permissions.enums";

import type { TAppAbility, TAppRawRule } from "./casl.types";
import { CaslCacheService } from "./casl-cache.service";

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly caslCacheService: CaslCacheService) {}

  async createForUser(context: IAbilityContext): Promise<TAppAbility> {
    const cacheKey = this.caslCacheService.buildUserCacheKey(context.userId);
    const cachedRules = await this.caslCacheService.getRules(cacheKey);
    if (cachedRules) {
      return this.buildAbilityFromRules(cachedRules);
    }

    const permissions = this.resolvePermissionsFromCatalog(context.role);
    const resolvedRules = this.toResolvedRules(permissions);
    await this.caslCacheService.setRules(cacheKey, resolvedRules);

    return this.buildAbilityFromRules(resolvedRules);
  }

  private buildAbilityFromRules(rules: TAppRawRule[]): TAppAbility {
    const { can, cannot, build } = new AbilityBuilder<TAppAbility>(createMongoAbility);
    const allowedRules = rules.filter((rule) => !rule.inverted);
    const deniedRules = rules.filter((rule) => rule.inverted);

    [...allowedRules, ...deniedRules].forEach((rule) => {
      if (rule.inverted) {
        cannot(rule.action, rule.subject);
        return;
      }

      can(rule.action, rule.subject);
    });

    return build();
  }

  private toResolvedRules(permissions: Permission[]): TAppRawRule[] {
    const deduplicated = new Map<string, TAppRawRule>();

    for (const permission of permissions) {
      const subject = permission.resource === EResource.ALL ? "all" : permission.resource;
      const dedupeKey = `${permission.denied}|${permission.action}|${permission.resource}`;

      deduplicated.set(dedupeKey, {
        action: permission.action,
        subject,
        ...(permission.denied ? { inverted: true } : {}),
      });
    }

    return [...deduplicated.values()];
  }

  private resolvePermissionsFromCatalog(role: EUserRole): Permission[] {
    const permittedCodes = new Set(DEFAULT_ROLE_PERMISSION_CODES[role] ?? []);
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
