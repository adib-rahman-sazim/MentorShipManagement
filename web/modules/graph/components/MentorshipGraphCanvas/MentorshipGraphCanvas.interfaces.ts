import type { OnSelectionChangeFunc } from "@xyflow/react";

import type { TGraphLayout } from "@/modules/graph/graph.types";

export interface IMentorshipGraphCanvasProps {
  layout: TGraphLayout;
  selectedPersonId: string | null;
  selectedLinkId: string | null;
  onSelectionChange: OnSelectionChangeFunc;
}
