import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { Permission } from "@/common/entities/permissions.entity";
import type { IAbilityContext, IUserAbility } from "@/modules/casl/casl.interfaces";
import { MentorshipHierarchyService } from "@/modules/mentorships/mentorship-hierarchy.service";
import type { IPolicyScope } from "@/modules/permissions/contextual-policies.interfaces";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { EPermissionConditionType, EResource } from "@/modules/permissions/permissions.enums";
import { buildPolicyConditions } from "@/modules/permissions/policy-resolution.helpers";

import type { TAppAbility, TAppRawRule } from "./casl.types";
import { CaslCacheService } from "./casl-cache.service";

@Injectable()
export class CaslAbilityFactory {
  constructor(
    private readonly caslCacheService: CaslCacheService,
    private readonly effectivePermissionsService: EffectivePermissionsService,
    private readonly mentorshipHierarchyService: MentorshipHierarchyService,
  ) {}

  async createForUser(context: IAbilityContext): Promise<TAppAbility> {
    const { ability } = await this.resolveUserAbility(context);
    return ability;
  }

  async resolveUserAbility(context: IAbilityContext): Promise<IUserAbility> {
    const cacheKey = this.caslCacheService.buildUserCacheKey(context.userId);
    const cachedUserAbility = await this.caslCacheService.getUserAbility(cacheKey);
    if (cachedUserAbility) {
      return {
        ability: this.buildAbilityFromRules(cachedUserAbility.rules),
        holdsAllManage: cachedUserAbility.holdsAllManage,
      };
    }

    const { permissions, holdsAllManage } =
      await this.effectivePermissionsService.resolveForUser(context);

    const scope = await this.resolveScope(context.userId, permissions, holdsAllManage);
    const resolvedRules = this.toResolvedRules(permissions, scope, holdsAllManage);
    await this.caslCacheService.setUserAbility(cacheKey, { rules: resolvedRules, holdsAllManage });

    return { ability: this.buildAbilityFromRules(resolvedRules), holdsAllManage };
  }

  private resolveConditionType(
    permission: Permission,
    holdsAllManage: boolean,
  ): EPermissionConditionType {
    return holdsAllManage ? EPermissionConditionType.NONE : permission.conditionType;
  }

  private async resolveScope(
    userId: string,
    permissions: Permission[],
    holdsAllManage: boolean,
  ): Promise<IPolicyScope> {
    const unscoped: IPolicyScope = { actorId: userId, subtreeUserIds: [], chainUserIds: [] };

    if (holdsAllManage) {
      return unscoped;
    }

    const conditionTypes = new Set(permissions.map((permission) => permission.conditionType));
    const needsChain = conditionTypes.has(EPermissionConditionType.HIERARCHY);
    const needsSubtree = needsChain || conditionTypes.has(EPermissionConditionType.SUBTREE);

    if (!needsSubtree && !needsChain) {
      return unscoped;
    }

    const [subtreeUserIds, chainUserIds] = await Promise.all([
      needsSubtree ? this.mentorshipHierarchyService.findSubtreeUserIds(userId) : [],
      needsChain ? this.mentorshipHierarchyService.findChainUserIds(userId) : [],
    ]);

    return { actorId: userId, subtreeUserIds, chainUserIds };
  }

  private buildAbilityFromRules(rules: TAppRawRule[]): TAppAbility {
    const { can, cannot, build } = new AbilityBuilder<TAppAbility>(createMongoAbility);
    const allowedRules = rules.filter((rule) => !rule.inverted);
    const deniedRules = rules.filter((rule) => rule.inverted);

    [...allowedRules, ...deniedRules].forEach((rule) => {
      if (rule.inverted) {
        cannot(rule.action, rule.subject, rule.conditions);
        return;
      }

      can(rule.action, rule.subject, rule.conditions);
    });

    return build();
  }

  private toResolvedRules(
    permissions: Permission[],
    scope: IPolicyScope,
    holdsAllManage: boolean,
  ): TAppRawRule[] {
    const deduplicated = new Map<string, TAppRawRule>();

    for (const permission of permissions) {
      const conditionType = this.resolveConditionType(permission, holdsAllManage);
      const subject = permission.resource === EResource.ALL ? "all" : permission.resource;
      const dedupeKey = `${permission.denied}|${permission.action}|${permission.resource}|${conditionType}`;
      const conditions = buildPolicyConditions(conditionType, scope);

      deduplicated.set(dedupeKey, {
        action: permission.action,
        subject,
        ...(conditions ? { conditions } : {}),
        ...(permission.denied ? { inverted: true } : {}),
      });
    }

    return [...deduplicated.values()];
  }
}
