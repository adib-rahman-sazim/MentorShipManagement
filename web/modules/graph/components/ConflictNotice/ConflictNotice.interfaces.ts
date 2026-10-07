import type { TDraftConflict } from "@/modules/graph/decision.types";
import type { TReviewChange } from "@/modules/graph/review.types";

export interface IConflictNoticeProps {
  conflict: TDraftConflict;
  changes: TReviewChange[] | null;
  canStartNewDraft: boolean;
  onStartNewDraft: () => void;
  onSelectPerson: (personId: string) => void;
}
