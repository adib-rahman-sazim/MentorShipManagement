import { ReactNode } from "react";

import { ReactFlowProvider } from "@xyflow/react";

import MentorshipGraphCanvas from "@/modules/graph/components/MentorshipGraphCanvas";
import MentorshipGraphEmptyState from "@/modules/graph/components/MentorshipGraphEmptyState";
import MentorshipGraphLoadError from "@/modules/graph/components/MentorshipGraphLoadError";
import MentorshipGraphSkeleton from "@/modules/graph/components/MentorshipGraphSkeleton";
import MentorshipGraphToolbar from "@/modules/graph/components/MentorshipGraphToolbar";

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
      <div className="min-h-96 flex-1">
        <ReactFlowProvider>
          <MentorshipGraphCanvas layout={layout} />
        </ReactFlowProvider>
      </div>
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
