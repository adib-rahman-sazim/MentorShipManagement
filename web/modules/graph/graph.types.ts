import type { Edge, Node } from "@xyflow/react";

import { EUserRole, IMentorshipGraphNodeResponse } from "@/shared/typedefs";

import { EGraphNodeType } from "./graph.enums";

export type TPersonNodeData = Pick<IMentorshipGraphNodeResponse, "name" | "role" | "state"> & {
  subordinateCount: number;
  hasSupervisor: boolean;
};

export type TPersonNode = Node<TPersonNodeData, EGraphNodeType.PERSON>;

export type TTierLabelNodeData = {
  role: EUserRole;
  count: number;
};

export type TTierLabelNode = Node<TTierLabelNodeData, EGraphNodeType.TIER_LABEL>;

export type TGraphNode = TPersonNode | TTierLabelNode;

export type TGraphLayout = {
  nodes: TGraphNode[];
  edges: Edge[];
};
