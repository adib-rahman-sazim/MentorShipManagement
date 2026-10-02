import type { FilterQuery } from "@mikro-orm/core";

import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";

export const MENTORSHIP_DRAFT_TITLE_MAX_LENGTH = 255;

export const MENTORSHIP_DRAFT_MAX_ITEMS = 100;

export const NOT_SOFT_DELETED_DRAFT = { deletedAt: null } satisfies FilterQuery<MentorshipDraft>;

export const MENTORSHIP_DRAFT_ERROR_MESSAGES = {
  DRAFT_NOT_FOUND: "Draft not found",
  NOT_DRAFT_AUTHOR: "Only the author of a draft can edit it",
  DRAFT_NOT_EDITABLE: "This draft has been submitted and can no longer be edited",
  INVALID_ITEMS: "Some changes in this draft are not allowed",
  ASSIGN_FORBIDDEN: "You do not have permission to change one or more of these mentorships",
  PROPOSED_SUPERVISOR_MISMATCH:
    "proposedSupervisorId must be a UUID for ASSIGN and REASSIGN, and empty for UNASSIGN",
  DUPLICATE_SUBORDINATE: "Each person can appear in at most one change per draft",
} as const;
