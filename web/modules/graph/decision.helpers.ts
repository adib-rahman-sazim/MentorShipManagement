import {
  EMentorshipDraftAction,
  EMentorshipDraftErrorCode,
  EMentorshipDraftStatus,
  IMentorshipDraftDetailResponse,
  IMentorshipDraftStaleItemsResponse,
} from "@/shared/typedefs";
import { isApiErrorMessage } from "@/shared/utils/errors";

import {
  AUTHOR_BLOCKED_TEXT,
  DECISION_ACTIONS_BY_STATUS,
  DECISION_BLOCKED_TEXT,
} from "./decision.constants";
import { EDraftConflictKind } from "./decision.enums";
import type { TDraftConflict } from "./decision.types";
import { isInvalidItemsError } from "./draft.helpers";

export function isStaleItemsError(
  error: unknown,
): error is { status: number; data: IMentorshipDraftStaleItemsResponse } {
  return (
    isApiErrorMessage(error) &&
    "errorCode" in error.data &&
    error.data.errorCode === EMentorshipDraftErrorCode.MENTORSHIP_DRAFT_STALE_ITEMS
  );
}

export function toDraftConflict(
  error: unknown,
  draftId: string,
  action: EMentorshipDraftAction,
): TDraftConflict | null {
  if (isStaleItemsError(error)) {
    return {
      draftId,
      action,
      kind: EDraftConflictKind.STALE,
      subordinateIds: error.data.errors.map(({ subordinateId }) => subordinateId),
    };
  }

  if (isInvalidItemsError(error)) {
    return {
      draftId,
      action,
      kind: EDraftConflictKind.INVALID,
      subordinateIds: error.data.errors.map(({ subordinateId }) => subordinateId),
    };
  }

  return null;
}

export function toDecisionComment(note: string): string | undefined {
  const comment = note.trim();

  return comment.length > 0 ? comment : undefined;
}

export function getDecisionBlock(
  {
    status,
    createdBy,
    allowedActions,
  }: Pick<IMentorshipDraftDetailResponse, "status" | "createdBy" | "allowedActions">,
  viewerId: string | null,
): string | null {
  const actions = DECISION_ACTIONS_BY_STATUS[status];

  if (!actions || actions.some((action) => allowedActions.includes(action))) {
    return null;
  }

  if (status === EMentorshipDraftStatus.IN_REVIEW && createdBy.id === viewerId) {
    return AUTHOR_BLOCKED_TEXT;
  }

  return DECISION_BLOCKED_TEXT[status] ?? null;
}
