import { DRAFT_STATUS_LABELS } from "@/modules/graph/draft.constants";
import type { TStaleChange } from "@/modules/graph/review.types";
import { IMentorshipDraftDetailResponse, IMentorshipDraftOverlapResponse } from "@/shared/typedefs";

import {
  CHANGED_BY_OTHER_DRAFT_TEXT,
  CHANGED_OUTSIDE_DRAFTS_TEXT,
  NO_MENTOR_NOW_TEXT,
} from "./DraftChangeAlerts.constants";

export function getStaleText({ currentSupervisorName }: TStaleChange): string {
  return currentSupervisorName
    ? `Out of date: now mentored by ${currentSupervisorName}.`
    : NO_MENTOR_NOW_TEXT;
}

export function getChangedByText(
  { changedByDraftId }: TStaleChange,
  changedBy: IMentorshipDraftDetailResponse | undefined,
): string {
  if (!changedByDraftId) {
    return CHANGED_OUTSIDE_DRAFTS_TEXT;
  }

  if (!changedBy) {
    return CHANGED_BY_OTHER_DRAFT_TEXT;
  }

  return changedBy.publishedBy
    ? `Moved by ${changedBy.publishedBy.name} in “${changedBy.title}”.`
    : `Moved in “${changedBy.title}”.`;
}

export function getOverlapText({ title, status }: IMentorshipDraftOverlapResponse): string {
  return `Also changed in “${title}” (${DRAFT_STATUS_LABELS[status].toLowerCase()}).`;
}
