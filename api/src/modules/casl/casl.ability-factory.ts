import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { Permission } from "@/common/entities/permissions.entity";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { EResource } from "@/modules/permissions/permissions.enums";

import type { TAppAbility, TAppRawRule } from "./casl.types";
import { CaslCacheService } from "./casl-cache.service";

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly caslCacheService: CaslCacheService,
    private readonly effectivePermissionsService: EffectivePermissionsService,
  ) {}

  async createForUser(context: IAbilityContext): Promise<TAppAbility> {
    const cacheKey = this.caslCacheService.buildUserCacheKey(context.userId);
    const cachedRules = await this.caslCacheService.getRules(cacheKey);
    if (cachedRules) {
      return this.buildAbilityFromRules(cachedRules);
    }

    const permissions = await this.effectivePermissionsService.resolveForUser(context);
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
}
