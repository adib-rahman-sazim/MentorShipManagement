import { EDraftConflictKind } from "@/modules/graph/decision.enums";
import { EMentorshipDraftAction } from "@/shared/typedefs";

export const CHANGE_NOUN = "change";
export const START_NEW_DRAFT_LABEL = "Start a new draft";

export const CONFLICT_VERBS: Partial<Record<EMentorshipDraftAction, string>> = {
  [EMentorshipDraftAction.APPROVE]: "approve",
  [EMentorshipDraftAction.PUBLISH]: "publish",
};

export const CONFLICT_REASONS: Record<EDraftConflictKind, string> = {
  [EDraftConflictKind.STALE]: "out of date",
  [EDraftConflictKind.INVALID]: "no longer valid",
};

export const CONFLICT_DESCRIPTIONS: Partial<Record<EMentorshipDraftAction, string>> = {
  [EMentorshipDraftAction.APPROVE]:
    "The draft is still in review. Reject it, and the author can start a new draft from today's hierarchy.",
  [EMentorshipDraftAction.PUBLISH]:
    "Nothing was applied, and the draft is still approved. Cancel it, then start a new draft from today's hierarchy.",
};
