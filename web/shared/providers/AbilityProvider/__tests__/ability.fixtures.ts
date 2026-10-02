import { createMongoAbility } from "@casl/ability";

import type { TAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import { EPermission, EResource, INormalizedCaslRuleResponse } from "@/shared/typedefs";

export const ACTOR_ID = "actor-id";
export const MENTEE_ID = "mentee-id";
export const SENSEI_ID = "sensei-id";
export const OUTSIDER_ID = "outsider-id";

function allow(
  action: EPermission,
  resource: EResource,
  conditions?: Record<string, unknown>,
): INormalizedCaslRuleResponse {
  return { action: [action], subject: [resource], ...(conditions ? { conditions } : {}) };
}

function idIn(ids: string[]): Record<string, unknown> {
  return { id: { $in: ids } };
}

const HIERARCHY_PAGE_RULES = [
  allow(EPermission.PAGE_VIEW, EResource.DASHBOARD),
  allow(EPermission.PAGE_VIEW, EResource.SETTINGS),
  allow(EPermission.PAGE_VIEW, EResource.MENTORSHIP_GRAPH),
];

export const SUPERADMIN_RULES: INormalizedCaslRuleResponse[] = [
  allow(EPermission.LIST, EResource.USER),
  allow(EPermission.READ, EResource.USER),
  allow(EPermission.CREATE, EResource.USER),
  allow(EPermission.UPDATE, EResource.USER),
  allow(EPermission.DELETE, EResource.USER),
  allow(EPermission.LIST, EResource.ROLE),
  allow(EPermission.READ, EResource.ROLE),
  allow(EPermission.CREATE, EResource.ROLE),
  allow(EPermission.UPDATE, EResource.ROLE),
  allow(EPermission.DELETE, EResource.ROLE),
  allow(EPermission.LIST, EResource.PERMISSIONS),
  allow(EPermission.READ, EResource.PERMISSIONS),
  allow(EPermission.CREATE, EResource.PERMISSIONS),
  allow(EPermission.UPDATE, EResource.PERMISSIONS),
  allow(EPermission.DELETE, EResource.PERMISSIONS),
  allow(EPermission.ASSIGN, EResource.MENTORSHIP),
  allow(EPermission.CREATE, EResource.DRAFT),
  allow(EPermission.REVIEW, EResource.DRAFT),
  allow(EPermission.APPROVE, EResource.DRAFT),
  allow(EPermission.PAGE_VIEW, EResource.USER),
  ...HIERARCHY_PAGE_RULES,
];

export const SENSEI_RULES: INormalizedCaslRuleResponse[] = [
  ...HIERARCHY_PAGE_RULES,
  allow(EPermission.ASSIGN, EResource.MENTORSHIP),
  allow(EPermission.CREATE, EResource.DRAFT),
  allow(EPermission.REVIEW, EResource.DRAFT),
  allow(EPermission.APPROVE, EResource.DRAFT),
  allow(EPermission.LIST, EResource.USER),
  allow(EPermission.READ, EResource.USER, idIn([MENTEE_ID])),
];

export const MENTOR_RULES: INormalizedCaslRuleResponse[] = [
  ...HIERARCHY_PAGE_RULES,
  allow(EPermission.READ, EResource.USER, idIn([MENTEE_ID, SENSEI_ID])),
];

export const MENTEE_RULES: INormalizedCaslRuleResponse[] = [
  ...HIERARCHY_PAGE_RULES,
  allow(EPermission.READ, EResource.USER, idIn([SENSEI_ID])),
];

export const SENSEI_WITH_USER_ADMIN_GRANTS_RULES: INormalizedCaslRuleResponse[] = [
  ...SENSEI_RULES,
  allow(EPermission.PAGE_VIEW, EResource.USER),
  allow(EPermission.UPDATE, EResource.USER),
];

export function buildAbility(rules: INormalizedCaslRuleResponse[]): TAppAbility {
  return createMongoAbility<TAppAbility>(rules);
}
