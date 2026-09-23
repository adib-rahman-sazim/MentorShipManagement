import { ForbiddenException } from "@nestjs/common";

import {
  CONTEXTUAL_POLICIES,
  CONTEXTUAL_POLICY_ERROR_MESSAGES,
} from "./contextual-policies.constants";
import type { IContextualPolicy, IPolicyScope } from "./contextual-policies.interfaces";
import type { TPolicyConditions } from "./contextual-policies.types";
import { EPermissionConditionType } from "./permissions.enums";

export function findContextualPolicy(
  conditionType: EPermissionConditionType,
): IContextualPolicy | undefined {
  return CONTEXTUAL_POLICIES[conditionType];
}

export function buildPolicyConditions(
  conditionType: EPermissionConditionType,
  scope: IPolicyScope,
): TPolicyConditions {
  const policy = findContextualPolicy(conditionType);

  if (!policy) {
    throw new ForbiddenException(
      `${CONTEXTUAL_POLICY_ERROR_MESSAGES.MISSING_POLICY}: ${conditionType}`,
    );
  }

  return policy.toConditions(scope);
}

export function isPolicySatisfied(
  conditionType: EPermissionConditionType,
  scope: IPolicyScope,
  subjectId: string,
): boolean {
  const policy = findContextualPolicy(conditionType);

  if (!policy) {
    return false;
  }

  return policy.isSatisfiedBy(scope, subjectId);
}

export function assertContextualPoliciesComplete(): void {
  const missing = Object.values(EPermissionConditionType).filter(
    (conditionType) => !findContextualPolicy(conditionType),
  );

  if (missing.length) {
    throw new Error(`${CONTEXTUAL_POLICY_ERROR_MESSAGES.MISSING_POLICY}: ${missing.join(", ")}`);
  }
}
