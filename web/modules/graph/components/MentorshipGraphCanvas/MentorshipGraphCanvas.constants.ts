import type { NodeTypes, ProOptions } from "@xyflow/react";

import PersonNode from "@/modules/graph/components/PersonNode";
import TierLabelNode from "@/modules/graph/components/TierLabelNode";
import { EGraphNodeType } from "@/modules/graph/graph.enums";

export const GRAPH_NODE_TYPES: NodeTypes = {
  [EGraphNodeType.PERSON]: PersonNode,
  [EGraphNodeType.TIER_LABEL]: TierLabelNode,
};

export const GRAPH_MIN_ZOOM = 0.2;
export const GRAPH_MAX_ZOOM = 1.5;
export const GRAPH_BACKGROUND_GAP = 16;

export const GRAPH_PRO_OPTIONS: ProOptions = { hideAttribution: true };
