import { ReactNode } from "react";

import { ReactFlowProvider } from "@xyflow/react";

import MentorshipGraphEmptyState from "@/modules/graph/components/MentorshipGraphEmptyState";
import MentorshipGraphLoadError from "@/modules/graph/components/MentorshipGraphLoadError";
import MentorshipGraphSkeleton from "@/modules/graph/components/MentorshipGraphSkeleton";
import MentorshipGraphToolbar from "@/modules/graph/components/MentorshipGraphToolbar";
import MentorshipGraphWorkspace from "@/modules/graph/components/MentorshipGraphWorkspace";

import { useMentorshipGraph } from "./MentorshipGraphContainer.hooks";

const MentorshipGraphContainer = () => {
  const { graph, layout, isLoading, errorMessage, refetch } = useMentorshipGraph();

  let content: ReactNode;

  if (isLoading) {
    content = <MentorshipGraphSkeleton />;
  } else if (!graph || !layout) {
    content = (
      <div className="p-4 md:p-8">
        <MentorshipGraphLoadError message={errorMessage} onRetry={refetch} />
      </div>
    );
  } else if (graph.nodes.length === 0) {
    content = (
      <div className="p-4 md:p-8">
        <MentorshipGraphEmptyState />
      </div>
    );
  } else {
    content = (
      <ReactFlowProvider>
        <MentorshipGraphWorkspace graph={graph} layout={layout} />
      </ReactFlowProvider>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <MentorshipGraphToolbar />
      {content}
    </div>
  );
};

export default MentorshipGraphContainer;
