import type {
  IMentorshipDraftDetailResponse,
  IMentorshipDraftOverlapResponse,
} from "@/shared/typedefs";

import type { TDraftChange, TDraftViolations } from "./draft.types";

export type TStaleChange = {
  currentSupervisorName: string | null;
  changedByDraftId: string | null;
};

export type TReviewChange = TDraftChange & {
  stale: TStaleChange | null;
  overlaps: IMentorshipDraftOverlapResponse[];
};

export type TDraftReview = {
  detail: IMentorshipDraftDetailResponse;
  isClosed: boolean;
  changes: TReviewChange[] | null;
  violations: TDraftViolations;
  staleIds: ReadonlySet<string>;
};
