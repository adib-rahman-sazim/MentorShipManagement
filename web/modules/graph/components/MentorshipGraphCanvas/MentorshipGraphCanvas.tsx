import { useEffect } from "react";

import { Background, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";

import GraphZoomControls from "@/modules/graph/components/GraphZoomControls";
import { getSelectedId, markSelected } from "@/modules/graph/graph.helpers";
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
  layout,
  selectedPersonId,
  selectedLinkId,
  onSelectionChange,
}: IMentorshipGraphCanvasProps) => {
  const isMobile = useIsMobile();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    markSelected(layout.nodes, selectedPersonId),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    markSelected(layout.edges, selectedLinkId),
  );

  useEffect(() => {
    setNodes((current) => markSelected(layout.nodes, getSelectedId(current)));
    setEdges((current) => markSelected(layout.edges, getSelectedId(current)));
  }, [layout, setNodes, setEdges]);

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
      nodesConnectable={false}
      edgesReconnectable={false}
      deleteKeyCode={null}
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
    </ReactFlow>
  );
};

export default MentorshipGraphCanvas;
