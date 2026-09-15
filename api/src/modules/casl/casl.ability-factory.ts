import { Injectable } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

import type { Permission } from "@/common/entities/permissions.entity";
import type { IAbilityContext } from "@/modules/casl/casl.interfaces";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { EPermissionConditionType, EResource } from "@/modules/permissions/permissions.enums";

import type { TAppRawRule, TAppAbility } from "./casl.types";
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

    const permissions = await this.effectivePermissionsService.resolveForUser(context);
    const subtreeUserIds = await this.resolveSubtreeUserIds(context.userId, permissions);
    const resolvedRules = this.toResolvedRules(permissions, subtreeUserIds);
    await this.caslCacheService.setRules(cacheKey, resolvedRules);

    return this.buildAbilityFromRules(resolvedRules);
  }

 
  async invalidateForMentorshipChange(userId: string): Promise<void> {
    const ancestorUserIds = await this.mentorshipsRepository.findAncestorUserIds(
      userId,
      MENTORSHIP_SUBTREE_MAX_DEPTH,
    );

    await this.caslCacheService.invalidateUsers([userId, ...ancestorUserIds]);
  }

  private async resolveSubtreeUserIds(
    userId: string,
    permissions: Permission[],
  ): Promise<string[]> {
    const needsSubtree = permissions.some(
      (permission) => permission.conditionType === EPermissionConditionType.SUBTREE,
    );

    if (!needsSubtree) {
      return [];
    }

    return this.mentorshipsRepository.findDescendantUserIds(userId, MENTORSHIP_SUBTREE_MAX_DEPTH);
  }

  private buildConditions(
    conditionType: EPermissionConditionType,
    subtreeUserIds: string[],
  ): Record<string, unknown> | undefined {
    if (conditionType !== EPermissionConditionType.SUBTREE) {
      return undefined;
    }

    return { id: { $in: subtreeUserIds } };
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

  private toResolvedRules(permissions: Permission[], subtreeUserIds: string[]): TAppRawRule[] {
    const deduplicated = new Map<string, TAppRawRule>();

    for (const permission of permissions) {
      const subject = permission.resource === EResource.ALL ? "all" : permission.resource;
      const dedupeKey = `${permission.denied}|${permission.action}|${permission.resource}|${permission.conditionType}`;
      const conditions = this.buildConditions(permission.conditionType, subtreeUserIds);

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