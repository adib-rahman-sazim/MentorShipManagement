import { formatDraftDateTime } from "@/modules/graph/review.helpers";

import { ACTIVITY_VERBS, UNKNOWN_ACTOR_NAME } from "./DraftActivityTimeline.constants";
import { EDraftActivityKind } from "./DraftActivityTimeline.enums";
import type {
  TDraftActivityEntry,
  TDraftActivityEvent,
  TDraftActivitySource,
} from "./DraftActivityTimeline.types";

function getActivityEvents(draft: TDraftActivitySource): TDraftActivityEvent[] {
  return [
    { kind: EDraftActivityKind.CREATED, at: draft.createdAt, actor: draft.createdBy },
    { kind: EDraftActivityKind.SUBMITTED, at: draft.submittedAt, actor: draft.createdBy },
    {
      kind: draft.approvedBy ? EDraftActivityKind.APPROVED : EDraftActivityKind.REJECTED,
      at: draft.decidedAt,
      actor: draft.approvedBy ?? draft.reviewedBy,
    },
    { kind: EDraftActivityKind.PUBLISHED, at: draft.publishedAt, actor: draft.publishedBy },
    { kind: EDraftActivityKind.CANCELLED, at: draft.cancelledAt, actor: draft.cancelledBy },
  ];
}

export function getDraftActivity(draft: TDraftActivitySource): TDraftActivityEntry[] {
  return getActivityEvents(draft)
    .flatMap(({ kind, at, actor }) =>
      at
        ? [
            {
              kind,
              text: `${ACTIVITY_VERBS[kind]} by ${actor?.name ?? UNKNOWN_ACTOR_NAME}`,
              time: formatDraftDateTime(at),
            },
          ]
        : [],
    )
    .reverse();
}
