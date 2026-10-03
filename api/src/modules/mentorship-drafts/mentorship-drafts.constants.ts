import type { FilterQuery } from "@mikro-orm/core";

import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";

export const MENTORSHIP_DRAFT_TITLE_MAX_LENGTH = 255;

export const MENTORSHIP_DRAFT_MAX_ITEMS = 100;

export const MENTORSHIP_DRAFT_DECISION_COMMENT_MAX_LENGTH = 2000;

export const NOT_SOFT_DELETED_DRAFT = { deletedAt: null } satisfies FilterQuery<MentorshipDraft>;

export const SUBMITTED_DRAFT = {
  submittedAt: { $ne: null },
} satisfies FilterQuery<MentorshipDraft>;

export const DRAFT_STATUS_TRANSITIONS: Readonly<
  Record<EMentorshipDraftStatus, readonly EMentorshipDraftStatus[]>
> = {
  [EMentorshipDraftStatus.DRAFT]: [
    EMentorshipDraftStatus.IN_REVIEW,
    EMentorshipDraftStatus.CANCELLED,
  ],
  [EMentorshipDraftStatus.IN_REVIEW]: [
    EMentorshipDraftStatus.APPROVED,
    EMentorshipDraftStatus.REJECTED,
    EMentorshipDraftStatus.CANCELLED,
  ],
  [EMentorshipDraftStatus.APPROVED]: [
    EMentorshipDraftStatus.PUBLISHED,
    EMentorshipDraftStatus.CANCELLED,
  ],
  [EMentorshipDraftStatus.REJECTED]: [],
  [EMentorshipDraftStatus.PUBLISHED]: [],
  [EMentorshipDraftStatus.CANCELLED]: [],
};

export const DRAFT_ACTOR_POPULATE = [
  "createdBy.role",
  "reviewedBy.role",
  "approvedBy.role",
  "publishedBy.role",
  "cancelledBy.role",
] as const;

export const DRAFT_ITEM_PEOPLE_POPULATE = ["subordinate.role", "proposedSupervisor.role"] as const;

export const DRAFT_ITEM_EXPECTED_MENTORSHIP_POPULATE = ["expectedCurrentMentorship"] as const;

export const DRAFT_ITEM_CHANGE_SUMMARY_POPULATE = [
  ...DRAFT_ITEM_PEOPLE_POPULATE,
  "expectedCurrentMentorship.supervisor.role",
] as const;

export const OVERLAPPING_DRAFT_STATUSES = [
  EMentorshipDraftStatus.IN_REVIEW,
  EMentorshipDraftStatus.APPROVED,
] as const;

export const QUERY_PARAM_TRUE = "true";

export const MENTORSHIP_DRAFT_ERROR_MESSAGES = {
  DRAFT_NOT_FOUND: "Draft not found",
  NOT_DRAFT_AUTHOR: "Only the author of a draft can change it",
  DRAFT_NOT_EDITABLE: "This draft has been submitted and can no longer be edited",
  INVALID_STATUS_TRANSITION: "This draft can't move to that status from its current status",
  EMPTY_DRAFT: "Add at least one change before submitting this draft",
  INVALID_ITEMS: "Some changes in this draft are not allowed",
  ASSIGN_FORBIDDEN: "You do not have permission to change one or more of these mentorships",
  PROPOSED_SUPERVISOR_MISMATCH:
    "proposedSupervisorId must be a UUID for ASSIGN and REASSIGN, and empty for UNASSIGN",
  DUPLICATE_SUBORDINATE: "Each person can appear in at most one change per draft",
  OWN_DRAFT_DECISION: "You can't approve or reject a draft you wrote",
  STALE_ITEMS: "Some changes in this draft no longer match the live hierarchy",
  NO_LONGER_VALID_ITEMS: "Some changes in this draft are no longer allowed for these people",
  CONCURRENT_PUBLISH: "Another change to these people was published at the same time",
  CANCEL_FORBIDDEN: "Only the author of a draft can cancel it",
  CANCEL_NOT_APPROVED: "Someone else's draft can be cancelled only once it is approved",
} as const;
