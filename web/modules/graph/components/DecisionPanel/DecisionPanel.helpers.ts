import pluralize from "pluralize";

import { EMentorshipDraftAction, IMentorshipDraftDetailResponse } from "@/shared/typedefs";

import { CHANGE_NOUN } from "./DecisionPanel.constants";
import type { TDecisionOptions } from "./DecisionPanel.types";

export function getDecisionOptions({
  allowedActions,
}: Pick<IMentorshipDraftDetailResponse, "allowedActions">): TDecisionOptions {
  return {
    canApprove: allowedActions.includes(EMentorshipDraftAction.APPROVE),
    canReject: allowedActions.includes(EMentorshipDraftAction.REJECT),
    canPublish: allowedActions.includes(EMentorshipDraftAction.PUBLISH),
    canCancel: allowedActions.includes(EMentorshipDraftAction.CANCEL),
  };
}

export function getApproveLabel(changeCount: number): string {
  return `Approve ${pluralize(CHANGE_NOUN, changeCount, true)}`;
}
