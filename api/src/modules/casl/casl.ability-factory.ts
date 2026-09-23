import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { Permission } from "@/common/entities/permissions.entity";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
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
    private readonly mentorshipsRepository: MentorshipsRepository,
  ) {}

  async createForUser(context: IAbilityContext): Promise<TAppAbility> {
    const cacheKey = this.caslCacheService.buildUserCacheKey(context.userId);
    const cachedRules = await this.caslCacheService.getRules(cacheKey);
    if (cachedRules) {
      return this.buildAbilityFromRules(cachedRules);
    }

    const { permissions, holdsAllManage } =
      await this.effectivePermissionsService.resolveForUser(context);

    const scope = await this.resolveScope(context.userId, permissions, holdsAllManage);
    const resolvedRules = this.toResolvedRules(permissions, scope, holdsAllManage);
    await this.caslCacheService.setRules(cacheKey, resolvedRules);

    return this.buildAbilityFromRules(resolvedRules);
  }

  async invalidateForMentorshipChange(userId: string): Promise<void> {
    const [ancestorUserIds, descendantUserIds] = await Promise.all([
      this.mentorshipsRepository.findAncestorUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH),
      this.mentorshipsRepository.findDescendantUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH),
    ]);

    await this.caslCacheService.invalidateUsers([userId, ...ancestorUserIds, ...descendantUserIds]);
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
      needsSubtree
        ? this.mentorshipsRepository.findDescendantUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH)
        : [],
      needsChain
        ? this.mentorshipsRepository.findAncestorUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH)
        : [],
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
