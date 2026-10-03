import type { TDraftNotice } from "@/modules/graph/draft.types";

export interface IDraftChangeNoticeProps {
  notice: TDraftNotice;
  isEditable: boolean;
  onUndo: (subordinateId: string) => void;
  onRemoveLink: (subordinateId: string) => void;
}
