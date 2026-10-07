import type { TReviewDraftEntry } from "@/modules/graph/components/ReviewDraftsMenu/ReviewDraftsMenu.types";

export interface IReviewDraftsMenuItemProps {
  entry: TReviewDraftEntry;
  onSelect: (draftId: string) => void;
}
