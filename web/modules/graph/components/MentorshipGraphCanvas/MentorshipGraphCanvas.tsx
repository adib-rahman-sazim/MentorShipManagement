import { useEffect } from "react";

import { Background, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";

import GraphZoomControls from "@/modules/graph/components/GraphZoomControls";
import { useIsMobile } from "@/shared/hooks/useIsMobile";

import {
  GRAPH_BACKGROUND_GAP,
  GRAPH_MAX_ZOOM,
  GRAPH_MIN_ZOOM,
  GRAPH_NODE_TYPES,
  GRAPH_PRO_OPTIONS,
} from "./MentorshipGraphCanvas.constants";
import { IMentorshipGraphCanvasProps } from "./MentorshipGraphCanvas.interfaces";

const MentorshipGraphCanvas = ({ layout }: IMentorshipGraphCanvasProps) => {
  const isMobile = useIsMobile();
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={GRAPH_NODE_TYPES}
      nodesDraggable={false}
      nodesConnectable={false}
      edgesReconnectable={false}
      deleteKeyCode={null}
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
