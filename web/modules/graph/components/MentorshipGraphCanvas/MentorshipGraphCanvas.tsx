import { useEffect } from "react";

import { Background, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";

import DraftConnectionHint from "@/modules/graph/components/DraftConnectionHint";
import GraphZoomControls from "@/modules/graph/components/GraphZoomControls";
import { DRAFT_DELETE_KEYS } from "@/modules/graph/draft.constants";
import type { TDraftEdge } from "@/modules/graph/draft.types";
import { getSelectedId, keepMeasured, markSelected } from "@/modules/graph/graph.helpers";
import type { TGraphNode } from "@/modules/graph/graph.types";
import { useIsMobile } from "@/shared/hooks/useIsMobile";

import {
  GRAPH_BACKGROUND_GAP,
  GRAPH_MAX_ZOOM,
  GRAPH_MIN_ZOOM,
  GRAPH_NODE_TYPES,
  GRAPH_PRO_OPTIONS,
} from "./MentorshipGraphCanvas.constants";
import { IMentorshipGraphCanvasProps } from "./MentorshipGraphCanvas.interfaces";

const MentorshipGraphCanvas = ({
  nodes: sourceNodes,
  edges: sourceEdges,
  selectedPersonId,
  selectedLinkId,
  onSelectionChange,
  draftEditing,
  children,
}: IMentorshipGraphCanvasProps) => {
  const isMobile = useIsMobile();
  const isEditing = draftEditing !== null;
  const [nodes, setNodes, onNodesChange] = useNodesState<TGraphNode>(
    markSelected(sourceNodes, selectedPersonId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<TDraftEdge>(
    markSelected(sourceEdges, selectedLinkId),
  );

  useEffect(() => {
    setNodes((current) => markSelected(keepMeasured(sourceNodes, current), getSelectedId(current)));
  }, [sourceNodes, setNodes]);

  useEffect(() => {
    setEdges((current) => markSelected(sourceEdges, getSelectedId(current)));
  }, [sourceEdges, setEdges]);

  useEffect(() => {
    setNodes((current) => markSelected(current, selectedPersonId));
  }, [selectedPersonId, setNodes]);

  useEffect(() => {
    setEdges((current) => markSelected(current, selectedLinkId));
  }, [selectedLinkId, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onSelectionChange={onSelectionChange}
      nodeTypes={GRAPH_NODE_TYPES}
      nodesDraggable={false}
      nodesConnectable={isEditing}
      edgesReconnectable={isEditing}
      elevateEdgesOnSelect={isEditing}
      deleteKeyCode={isEditing ? DRAFT_DELETE_KEYS : null}
      isValidConnection={draftEditing?.isValidConnection}
      onConnect={draftEditing?.onConnect}
      onConnectEnd={draftEditing?.onConnectEnd}
      onReconnectStart={draftEditing?.onReconnectStart}
      onReconnect={draftEditing?.onReconnect}
      onReconnectEnd={draftEditing?.onReconnectEnd}
      onBeforeDelete={draftEditing?.onBeforeDelete}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      elementsSelectable
      onlyRenderVisibleElements
      fitView
      minZoom={GRAPH_MIN_ZOOM}
      maxZoom={GRAPH_MAX_ZOOM}
      proOptions={GRAPH_PRO_OPTIONS}
    >
      <Background gap={GRAPH_BACKGROUND_GAP} />
      <GraphZoomControls />
      {isMobile ? null : <MiniMap pannable zoomable />}
      {draftEditing ? (
        <DraftConnectionHint
          context={draftEditing.context}
          movingSubordinateId={draftEditing.movingSubordinateId}
        />
      ) : null}
      {children}
    </ReactFlow>
  );
};

export default MentorshipGraphCanvas;
