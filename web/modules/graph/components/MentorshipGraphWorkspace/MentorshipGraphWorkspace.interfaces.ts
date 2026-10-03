import type { TGraphLayout } from "@/modules/graph/graph.types";
import { IMentorshipGraphResponse } from "@/shared/typedefs";

export interface IMentorshipGraphWorkspaceProps {
  graph: IMentorshipGraphResponse;
  layout: TGraphLayout;
}
