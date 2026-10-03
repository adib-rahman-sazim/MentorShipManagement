import type { TDraftChange } from "@/modules/graph/draft.types";

export interface IDraftChangeRowProps {
  change: TDraftChange;
  isEditable: boolean;
  onSelect: (personId: string) => void;
  onRemove: (subordinateId: string) => void;
}
