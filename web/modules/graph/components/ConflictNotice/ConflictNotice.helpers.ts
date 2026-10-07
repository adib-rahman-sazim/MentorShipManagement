import pluralize from "pluralize";

import type { TDraftConflict } from "@/modules/graph/decision.types";
import type { TReviewChange } from "@/modules/graph/review.types";

import { CHANGE_NOUN, CONFLICT_REASONS, CONFLICT_VERBS } from "./ConflictNotice.constants";

export function getConflictTitle({ action, kind, subordinateIds }: TDraftConflict): string {
  const verb = CONFLICT_VERBS[action] ?? action;
  const changes = pluralize(CHANGE_NOUN, subordinateIds.length, true);

  return `Couldn't ${verb}: ${changes} ${CONFLICT_REASONS[kind]}`;
}

export function getConflictChanges(
  { subordinateIds }: TDraftConflict,
  changes: readonly TReviewChange[] | null,
): TReviewChange[] {
  const conflictIds = new Set(subordinateIds);

  return (changes ?? []).filter(({ subordinateId }) => conflictIds.has(subordinateId));
}
