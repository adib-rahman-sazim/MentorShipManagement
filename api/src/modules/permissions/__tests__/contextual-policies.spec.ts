import { ForbiddenException } from "@nestjs/common";

import type { IPolicyScope } from "@/modules/permissions/contextual-policies.interfaces";
import { EPermissionConditionType } from "@/modules/permissions/permissions.enums";
import {
  assertContextualPoliciesComplete,
  buildPolicyConditions,
  isPolicySatisfied,
} from "@/modules/permissions/policy-resolution.helpers";

const ACTOR_ID = "00000000-0000-4000-8000-000000000001";
const BELOW_ID = "00000000-0000-4000-8000-0000000000a1";
const ABOVE_ID = "00000000-0000-4000-8000-0000000000b1";
const OUTSIDER_ID = "00000000-0000-4000-8000-0000000000ff";

const UNKNOWN_CONDITION_TYPE = "ancestors" as EPermissionConditionType;

const { NONE, SELF, SUBTREE, HIERARCHY, NOT_AUTHOR } = EPermissionConditionType;

const SCOPE: IPolicyScope = {
  actorId: ACTOR_ID,
  subtreeUserIds: [BELOW_ID],
  chainUserIds: [ABOVE_ID],
};

describe("contextual policies", () => {
  it("has a function for every declared rule name", () => {
    expect(() => assertContextualPoliciesComplete()).not.toThrow();
  });

  it.each([
    [SELF, ACTOR_ID, true],
    [SELF, BELOW_ID, false],
    [SUBTREE, BELOW_ID, true],
    [SUBTREE, OUTSIDER_ID, false],
    [SUBTREE, ACTOR_ID, false],
    [HIERARCHY, BELOW_ID, true],
    [HIERARCHY, ABOVE_ID, true],
    [HIERARCHY, OUTSIDER_ID, false],
    [HIERARCHY, ACTOR_ID, false],
    [NOT_AUTHOR, BELOW_ID, true],
    [NOT_AUTHOR, ACTOR_ID, false],
    [NONE, OUTSIDER_ID, true],
  ])("%s decides subject %s as %s", (conditionType, subjectId, expected) => {
    expect(isPolicySatisfied(conditionType, SCOPE, subjectId)).toBe(expected);
  });

  it("refuses an unknown rule rather than allowing it", () => {
    expect(isPolicySatisfied(UNKNOWN_CONDITION_TYPE, SCOPE, ACTOR_ID)).toBe(false);
    expect(() => buildPolicyConditions(UNKNOWN_CONDITION_TYPE, SCOPE)).toThrow(ForbiddenException);
  });
});
