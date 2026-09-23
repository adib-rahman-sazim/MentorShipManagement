import {
  hierarchyConditions,
  isAnySubjectAllowed,
  isHierarchySubject,
  isNotAuthorSubject,
  isSelfSubject,
  isSubtreeSubject,
  notAuthorConditions,
  selfConditions,
  subtreeConditions,
  unconditionalConditions,
} from "./contextual-policies.helpers";
import type { IContextualPolicy } from "./contextual-policies.interfaces";
import { EPermissionConditionType } from "./permissions.enums";

export const CONTEXTUAL_POLICIES: Record<EPermissionConditionType, IContextualPolicy> = {
  [EPermissionConditionType.NONE]: {
    toConditions: unconditionalConditions,
    isSatisfiedBy: isAnySubjectAllowed,
  },
  [EPermissionConditionType.SELF]: {
    toConditions: selfConditions,
    isSatisfiedBy: isSelfSubject,
  },
  [EPermissionConditionType.SUBTREE]: {
    toConditions: subtreeConditions,
    isSatisfiedBy: isSubtreeSubject,
  },
  [EPermissionConditionType.HIERARCHY]: {
    toConditions: hierarchyConditions,
    isSatisfiedBy: isHierarchySubject,
  },
  [EPermissionConditionType.NOT_AUTHOR]: {
    toConditions: notAuthorConditions,
    isSatisfiedBy: isNotAuthorSubject,
  },
};

export const CONTEXTUAL_POLICY_ERROR_MESSAGES = {
  MISSING_POLICY: "No contextual policy is registered for condition type",
} as const;