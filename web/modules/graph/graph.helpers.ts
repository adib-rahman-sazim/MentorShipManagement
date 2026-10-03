import { EdgeLabel, Graph, GraphLabel, layout, NodeLabel } from "@dagrejs/dagre";
import type { Viewport, XYPosition } from "@xyflow/react";

import { IMentorshipGraphEdgeResponse, IMentorshipGraphNodeResponse } from "@/shared/typedefs";

import {
  GRAPH_EDGE_TYPE,
  GRAPH_LAYOUT_DIRECTION,
  GRAPH_NODE_SEPARATION,
  GRAPH_RANK_SEPARATION,
  GRAPH_ROOT_ID,
  GRAPH_TIER_ROLES,
  PERSON_NODE_HEIGHT,
  PERSON_NODE_WIDTH,
  ROLE_TIER,
  TIER_LABEL_ID_PREFIX,
  TIER_LABEL_OFFSET_Y,
} from "./graph.constants";
import { EGraphNodeType, EGraphSelectionKind } from "./graph.enums";
import {
  TGraphLayout,
  TGraphNode,
  TGraphSelection,
  TPersonNode,
  TSelectableElement,
  TTierLabelNode,
} from "./graph.types";

export function layoutGraph(
  nodes: IMentorshipGraphNodeResponse[],
  edges: IMentorshipGraphEdgeResponse[],
): TGraphLayout {
  const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>();
  graph.setGraph({
    rankdir: GRAPH_LAYOUT_DIRECTION,
    ranksep: GRAPH_RANK_SEPARATION,
    nodesep: GRAPH_NODE_SEPARATION,
  });
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setNode(GRAPH_ROOT_ID, { width: 0, height: 0 });

  const supervisedIds = new Set(edges.map(({ subordinateId }) => subordinateId));

  for (const node of nodes) {
    graph.setNode(node.id, { width: PERSON_NODE_WIDTH, height: PERSON_NODE_HEIGHT });

    if (!supervisedIds.has(node.id)) {
      graph.setEdge(GRAPH_ROOT_ID, node.id, { minlen: ROLE_TIER[node.role] });
    }
  }

  for (const { supervisorId, subordinateId } of edges) {
    graph.setEdge(supervisorId, subordinateId);
  }

  layout(graph);

  const personNodes: TPersonNode[] = nodes.map(({ id, name, role, state }) => {
    const { x = 0, y = 0 } = graph.node(id);

    return {
      id,
      type: EGraphNodeType.PERSON,
      position: { x: x - PERSON_NODE_WIDTH / 2, y: y - PERSON_NODE_HEIGHT / 2 },
      data: {
        name,
        role,
        state,
        subordinateCount: edges.filter(({ supervisorId }) => supervisorId === id).length,
        hasSupervisor: supervisedIds.has(id),
      },
    };
  });

  return {
    nodes: [...getTierLabelNodes(personNodes), ...personNodes],
    edges: edges.map(({ id, supervisorId, subordinateId }) => ({
      id,
      source: supervisorId,
      target: subordinateId,
      type: GRAPH_EDGE_TYPE,
    })),
  };
}

function getTierLabelNodes(personNodes: TPersonNode[]): TTierLabelNode[] {
  const left = Math.min(...personNodes.map(({ position }) => position.x));

  return GRAPH_TIER_ROLES.flatMap((role) => {
    const tier = personNodes.filter(({ data }) => data.role === role);
    const firstInTier = tier[0];

    return firstInTier
      ? [
          {
            id: `${TIER_LABEL_ID_PREFIX}${role}`,
            type: EGraphNodeType.TIER_LABEL,
            position: { x: left, y: firstInTier.position.y - TIER_LABEL_OFFSET_Y },
            data: { role, count: tier.length },
            selectable: false,
            focusable: false,
            draggable: false,
          },
        ]
      : [];
  });
}

export function getGraphSelection(
  personId: string | null,
  linkId: string | null,
): TGraphSelection | null {
  if (personId) {
    return { kind: EGraphSelectionKind.PERSON, id: personId };
  }

  if (linkId) {
    return { kind: EGraphSelectionKind.LINK, id: linkId };
  }

  return null;
}

export function getSelectedId(elements: readonly TSelectableElement[]): string | null {
  return elements.find(({ selected }) => selected)?.id ?? null;
}

export function markSelected<TElement extends TSelectableElement>(
  elements: TElement[],
  selectedId: string | null,
): TElement[] {
  return elements.map((element) => {
    const selected = element.id === selectedId;

    return (element.selected ?? false) === selected ? element : { ...element, selected };
  });
}

export function keepMeasured(
  nodes: TGraphNode[],
  currentNodes: readonly TGraphNode[],
): TGraphNode[] {
  const measuredById = new Map(currentNodes.map(({ id, measured }) => [id, measured]));

  return nodes.map((node) => {
    const measured = measuredById.get(node.id);

    return measured ? { ...node, measured } : node;
  });
}

export function getPersonCenter({ x, y }: XYPosition): XYPosition {
  return { x: x + PERSON_NODE_WIDTH / 2, y: y + PERSON_NODE_HEIGHT / 2 };
}

export function isPersonInView(
  { x, y }: XYPosition,
  { x: offsetX, y: offsetY, zoom }: Viewport,
  width: number,
  height: number,
): boolean {
  const left = x * zoom + offsetX;
  const top = y * zoom + offsetY;

  return (
    left >= 0 &&
    top >= 0 &&
    left + PERSON_NODE_WIDTH * zoom <= width &&
    top + PERSON_NODE_HEIGHT * zoom <= height
  );
}
