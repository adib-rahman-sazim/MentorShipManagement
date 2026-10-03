import { ReactNode } from "react";

import type { OnSelectionChangeFunc } from "@xyflow/react";

import type { IDraftCanvasHandlers } from "@/modules/graph/draft.interfaces";
import type { TDraftEdge } from "@/modules/graph/draft.types";
import type { TGraphNode } from "@/modules/graph/graph.types";

export interface IMentorshipGraphCanvasProps {
  nodes: TGraphNode[];
  edges: TDraftEdge[];
  selectedPersonId: string | null;
  selectedLinkId: string | null;
  onSelectionChange: OnSelectionChangeFunc;
  draftEditing: IDraftCanvasHandlers | null;
  children?: ReactNode;
}
