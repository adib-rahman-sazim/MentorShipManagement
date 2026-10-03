import type { TGraphSelection } from "@/modules/graph/graph.types";
import { IMentorshipGraphResponse } from "@/shared/typedefs";

export interface IGraphSidePanelProps {
  graph: IMentorshipGraphResponse;
  selection: TGraphSelection | null;
  isCompact: boolean;
  onSelectPerson: (personId: string) => void;
  onOpen: () => void;
  onClear: () => void;
}
