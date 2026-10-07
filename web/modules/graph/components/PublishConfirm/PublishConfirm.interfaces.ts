import type { TReviewChange } from "@/modules/graph/review.types";

export interface IPublishConfirmProps {
  changes: TReviewChange[] | null;
  changeCount: number;
  isBusy: boolean;
  onConfirm: () => Promise<void>;
}
