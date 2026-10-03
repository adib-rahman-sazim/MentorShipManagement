import { EMentorshipDraftAction, EMentorshipDraftStatus } from "@/shared/typedefs";

import { EReviewDraftGroup } from "./ReviewDraftsMenu.enums";
import type { TReviewDraftGroupConfig } from "./ReviewDraftsMenu.types";

export const REVIEW_DRAFTS_LABEL = "Review drafts";
export const LOADING_DRAFTS_TEXT = "Loading drafts…";
export const NO_DRAFTS_TEXT = "No drafts yet.";
export const YOU_LABEL = "You";
export const CHANGE_NOUN = "change";
export const META_SEPARATOR = " · ";

export const REVIEW_DRAFTS_PAGE_SIZE = 10;
export const FIRST_PAGE = 1;

export const WAITING_ACTIONS: readonly EMentorshipDraftAction[] = [
  EMentorshipDraftAction.APPROVE,
  EMentorshipDraftAction.REJECT,
  EMentorshipDraftAction.PUBLISH,
];

export const REVIEW_DRAFT_GROUPS: readonly TReviewDraftGroupConfig[] = [
  {
    group: EReviewDraftGroup.IN_REVIEW,
    label: "In review",
    statuses: [EMentorshipDraftStatus.IN_REVIEW],
  },
  {
    group: EReviewDraftGroup.APPROVED,
    label: "Approved",
    statuses: [EMentorshipDraftStatus.APPROVED],
  },
  {
    group: EReviewDraftGroup.MINE,
    label: "Mine",
    statuses: [EMentorshipDraftStatus.DRAFT],
  },
  {
    group: EReviewDraftGroup.CLOSED,
    label: "Closed",
    statuses: [
      EMentorshipDraftStatus.REJECTED,
      EMentorshipDraftStatus.PUBLISHED,
      EMentorshipDraftStatus.CANCELLED,
    ],
  },
];

export const ALWAYS_LOADED_STATUSES: readonly EMentorshipDraftStatus[] = [
  EMentorshipDraftStatus.IN_REVIEW,
  EMentorshipDraftStatus.APPROVED,
];
