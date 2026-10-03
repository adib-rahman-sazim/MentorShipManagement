import { ReactNode, useMemo } from "react";

import { ReactFlowProvider } from "@xyflow/react";

import DraftBar from "@/modules/graph/components/DraftBar";
import MentorshipGraphEmptyState from "@/modules/graph/components/MentorshipGraphEmptyState";
import MentorshipGraphLoadError from "@/modules/graph/components/MentorshipGraphLoadError";
import MentorshipGraphSkeleton from "@/modules/graph/components/MentorshipGraphSkeleton";
import MentorshipGraphToolbar from "@/modules/graph/components/MentorshipGraphToolbar";
import MentorshipGraphWorkspace from "@/modules/graph/components/MentorshipGraphWorkspace";
import { countDraftOperations } from "@/modules/graph/draft.helpers";
import { getDraftByline } from "@/modules/graph/review.helpers";

import {
  useDraftDecisions,
  useDraftReview,
  useGraphDraft,
  useMentorshipGraph,
} from "./MentorshipGraphContainer.hooks";

const MentorshipGraphContainer = () => {
  const { graph, layout, isLoading, errorMessage, refetch } = useMentorshipGraph();
  const draft = useGraphDraft();
  const review = useDraftReview(draft);
  const decisions = useDraftDecisions(draft.detail);
  const counts = useMemo(() => countDraftOperations(draft.items), [draft.items]);

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
        <MentorshipGraphWorkspace
          graph={graph}
          layout={layout}
          draft={draft}
          review={review}
          decisions={decisions}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {draft.isActive ? (
        <DraftBar
          title={draft.title}
          status={draft.status}
          byline={review ? getDraftByline(review.detail) : null}
          isEditable={draft.isEditable}
          counts={counts}
          changeCount={draft.items.length}
          onOpenChanges={draft.openChangesSheet}
          onExit={draft.exitDraft}
        />
      ) : (
        <MentorshipGraphToolbar
          canCreateDraft={draft.canCreateDraft}
          canReadDrafts={draft.canReadDrafts}
          onNewDraft={draft.startNewDraft}
          onOpenDraft={draft.openDraft}
        />
      )}
      {content}
    </div>
  );
};

export default MentorshipGraphContainer;
