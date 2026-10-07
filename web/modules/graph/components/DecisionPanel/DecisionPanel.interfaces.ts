import type { IDraftDecisions } from "@/modules/graph/decision.interfaces";
import type { TDraftReview } from "@/modules/graph/review.types";

export interface IDecisionPanelProps {
  review: TDraftReview;
  decisions: IDraftDecisions;
  canStartNewDraft: boolean;
  onStartNewDraft: () => void;
  onSelectPerson: (personId: string) => void;
}
