import { EMentorshipDraftAction, EMentorshipDraftStatus } from "@/shared/typedefs";

import type { TDraftNote } from "./decision.types";

export const DECISION_COMMENT_MAX_LENGTH = 2000;
export const EMPTY_DRAFT_NOTE: TDraftNote = { draftId: null, text: "" };

export const DECISION_ACTIONS_BY_STATUS: Partial<
  Record<EMentorshipDraftStatus, readonly EMentorshipDraftAction[]>
> = {
  [EMentorshipDraftStatus.IN_REVIEW]: [
    EMentorshipDraftAction.APPROVE,
    EMentorshipDraftAction.REJECT,
  ],
  [EMentorshipDraftStatus.APPROVED]: [EMentorshipDraftAction.PUBLISH],
};

export const DECISION_BLOCKED_TEXT: Partial<Record<EMentorshipDraftStatus, string>> = {
  [EMentorshipDraftStatus.IN_REVIEW]:
    "Waiting for someone who reviews drafts to approve or reject it.",
  [EMentorshipDraftStatus.APPROVED]: "Only the Superadmin can publish an approved draft.",
};

export const AUTHOR_BLOCKED_TEXT =
  "You wrote this draft, so someone else who reviews drafts has to approve or reject it.";

export const DRAFT_APPROVED_MESSAGE = "Draft approved";
export const DRAFT_REJECTED_MESSAGE = "Draft rejected";
export const DRAFT_PUBLISHED_MESSAGE = "Draft published. The live hierarchy is updated.";
export const DRAFT_CANCELLED_MESSAGE = "Draft cancelled";
