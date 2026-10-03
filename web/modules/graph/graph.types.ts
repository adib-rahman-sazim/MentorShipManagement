import type { Edge, Node } from "@xyflow/react";

import {
  EUserRole,
  IMentorshipGraphEdgeResponse,
  IMentorshipGraphNodeResponse,
} from "@/shared/typedefs";

import { EGraphNodeType, EGraphSelectionKind } from "./graph.enums";

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

export type TGraphSelection = {
  kind: EGraphSelectionKind;
  id: string;
};

export type TSelectableElement = {
  id: string;
  selected?: boolean;
};

export type TPersonDetails = {
  person: IMentorshipGraphNodeResponse;
  supervisor: IMentorshipGraphNodeResponse | null;
  supervisorRole: EUserRole | null;
  subordinateRole: EUserRole | null;
  subordinates: IMentorshipGraphNodeResponse[];
};

export type TLinkDetails = {
  link: IMentorshipGraphEdgeResponse;
  supervisor: IMentorshipGraphNodeResponse;
  subordinate: IMentorshipGraphNodeResponse;
};
