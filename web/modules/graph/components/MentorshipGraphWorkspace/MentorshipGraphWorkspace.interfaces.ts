import type { IGraphDraft } from "@/modules/graph/draft.interfaces";
import type { TDraftContext, TDraftItem } from "@/modules/graph/draft.types";
import type { TGraphLayout } from "@/modules/graph/graph.types";
import { IMentorshipGraphResponse } from "@/shared/typedefs";

export interface IMentorshipGraphWorkspaceProps {
  graph: IMentorshipGraphResponse;
  layout: TGraphLayout;
  draft: IGraphDraft;
}

export interface IDraftCanvasHandlersParams {
  context: TDraftContext;
  isEditable: boolean;
  onItemsChange: (items: TDraftItem[]) => void;
}
