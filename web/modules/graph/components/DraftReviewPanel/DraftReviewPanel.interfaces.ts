import { ReactNode } from "react";

import type { TDraftReview } from "@/modules/graph/review.types";

export interface IDraftReviewPanelProps {
  review: TDraftReview;
  onSelectPerson: (personId: string) => void;
  decisionSlot?: ReactNode;
}
