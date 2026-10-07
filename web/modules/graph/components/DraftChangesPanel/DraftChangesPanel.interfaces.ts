import { ReactNode } from "react";

import type { IGraphDraft } from "@/modules/graph/draft.interfaces";
import type { TDraftChange } from "@/modules/graph/draft.types";

export interface IDraftChangesPanelProps {
  draft: IGraphDraft;
  changes: TDraftChange[];
  onSelectPerson: (personId: string) => void;
  onRemoveChange: (subordinateId: string) => void;
  cancelSlot?: ReactNode;
}
