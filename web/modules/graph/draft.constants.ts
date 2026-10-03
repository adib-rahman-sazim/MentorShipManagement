import { parseAsString } from "nuqs";

import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipRelationshipType,
  EMentorshipViolation,
  EUserRole,
} from "@/shared/typedefs";

import type { TConnectionCheck, TDraftOperationDetails } from "./draft.types";

export const DRAFT_QUERY_KEY = "draft";
export const DRAFT_QUERY_PARSER = parseAsString;
export const NEW_DRAFT_ID = "new";

export const PROPOSED_EDGE_ID_PREFIX = "draft-";
export const DRAFT_TITLE_MAX_LENGTH = 255;
export const LOOP_CHECK_MAX_DEPTH = 10;
export const DRAFT_DELETE_KEYS = ["Delete", "Backspace"];

export const RELATIONSHIP_TYPE_BY_SUBORDINATE_ROLE: Partial<
  Record<EUserRole, EMentorshipRelationshipType>
> = {
  [EUserRole.MENTOR]: EMentorshipRelationshipType.SENSEI_MENTOR,
  [EUserRole.MENTEE]: EMentorshipRelationshipType.MENTOR_MENTEE,
};

export const DRAFT_OPERATION_DETAILS: Record<EMentorshipDraftOperation, TDraftOperationDetails> = {
  [EMentorshipDraftOperation.ASSIGN]: {
    word: "Assign",
    glyph: "+",
    textClassName: "text-op-assign",
    badgeClassName: "border-status-published-line bg-status-published-bg text-op-assign",
  },
  [EMentorshipDraftOperation.REASSIGN]: {
    word: "Reassign",
    glyph: "~",
    textClassName: "text-op-reassign",
    badgeClassName: "border-status-review-line bg-status-review-bg text-op-reassign",
  },
  [EMentorshipDraftOperation.UNASSIGN]: {
    word: "Unassign",
    glyph: "−",
    textClassName: "text-op-unassign",
    badgeClassName: "border-status-rejected-line bg-status-rejected-bg text-op-unassign",
  },
};

export const DRAFT_OPERATION_ORDER: readonly EMentorshipDraftOperation[] = [
  EMentorshipDraftOperation.ASSIGN,
  EMentorshipDraftOperation.REASSIGN,
  EMentorshipDraftOperation.UNASSIGN,
];

export const PROPOSED_EDGE_CLASS: Partial<Record<EMentorshipDraftOperation, string>> = {
  [EMentorshipDraftOperation.ASSIGN]: "draft-edge-proposed draft-edge-assign",
  [EMentorshipDraftOperation.REASSIGN]: "draft-edge-proposed draft-edge-reassign",
};

export const REPLACED_EDGE_CLASS: Partial<Record<EMentorshipDraftOperation, string>> = {
  [EMentorshipDraftOperation.REASSIGN]: "draft-edge-replaced",
  [EMentorshipDraftOperation.UNASSIGN]: "draft-edge-replaced draft-edge-unassign",
};

export const VIOLATION_LABELS: Record<EMentorshipViolation, string> = {
  [EMentorshipViolation.SELF_MENTORSHIP]: "A person can't mentor themselves.",
  [EMentorshipViolation.ILLEGAL_ROLE_PAIR]: "These roles can't be linked.",
  [EMentorshipViolation.CYCLE]: "This would create a loop in the hierarchy.",
  [EMentorshipViolation.INACTIVE_USER]: "Someone in this change is inactive.",
  [EMentorshipViolation.USER_NOT_FOUND]: "Someone in this change no longer exists.",
  [EMentorshipViolation.ALREADY_ASSIGNED]: "They already have a mentor.",
  [EMentorshipViolation.NOT_ASSIGNED]: "They have no mentor to change.",
  [EMentorshipViolation.SAME_SUPERVISOR]: "They already report to this person.",
};

export const CONNECTION_OK: TConnectionCheck = { ok: true, reason: null };

export const NO_MENTOR_NAME = "No mentor";
export const UNKNOWN_PERSON_REASON = "Drop the link on a person.";
export const LOOP_REASON = "That would create a loop in the hierarchy.";
export const MOVE_SUPERVISOR_END_REASON = "Only the top end of a link can be moved.";

export const DRAFT_STATUS_LABELS: Record<EMentorshipDraftStatus, string> = {
  [EMentorshipDraftStatus.DRAFT]: "Draft",
  [EMentorshipDraftStatus.IN_REVIEW]: "In review",
  [EMentorshipDraftStatus.APPROVED]: "Approved",
  [EMentorshipDraftStatus.REJECTED]: "Rejected",
  [EMentorshipDraftStatus.PUBLISHED]: "Published",
  [EMentorshipDraftStatus.CANCELLED]: "Cancelled",
};

export const UNTITLED_DRAFT_LABEL = "Untitled draft";
