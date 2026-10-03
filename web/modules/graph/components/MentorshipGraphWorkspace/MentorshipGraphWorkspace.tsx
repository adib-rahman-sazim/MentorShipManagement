import { ReactNode, useMemo } from "react";

import DraftChangeNotice from "@/modules/graph/components/DraftChangeNotice";
import DraftChangesPanel from "@/modules/graph/components/DraftChangesPanel";
import DraftReadOnlyHint from "@/modules/graph/components/DraftReadOnlyHint";
import DraftReviewPanel from "@/modules/graph/components/DraftReviewPanel";
import GraphSidePanel from "@/modules/graph/components/GraphSidePanel";
import MentorshipGraphCanvas from "@/modules/graph/components/MentorshipGraphCanvas";
import ReviewChangeNotice from "@/modules/graph/components/ReviewChangeNotice";
import {
  applyDraftToGraph,
  getDraftChanges,
  getDraftNotice,
  indexGraph,
  removeChange,
  stageChange,
  withDraftNodeData,
  withEdgePermissions,
} from "@/modules/graph/draft.helpers";
import { withReviewMarks, withStaleEdges } from "@/modules/graph/review.helpers";
import { useAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";

import { NO_DRAFT_ITEMS, NO_STALE_IDS } from "./MentorshipGraphWorkspace.constants";
import {
  useDraftCanvasHandlers,
  useGraphSelection,
  useIsCompactGraph,
} from "./MentorshipGraphWorkspace.hooks";
import { IMentorshipGraphWorkspaceProps } from "./MentorshipGraphWorkspace.interfaces";

const MentorshipGraphWorkspace = ({
  graph,
  layout,
  draft,
  review,
}: IMentorshipGraphWorkspaceProps) => {
  const isCompact = useIsCompactGraph();
  const ability = useAppAbility();
  const {
    selection,
    selectedPersonId,
    selectedLinkId,
    handleSelectionChange,
    focusPerson,
    revealSelectedPerson,
    clearSelection,
  } = useGraphSelection();
  const { isActive, isEditable } = draft;
  const items = isActive ? draft.items : NO_DRAFT_ITEMS;
  const isEditing = isActive && isEditable;
  const overlayItems = review?.isClosed ? NO_DRAFT_ITEMS : items;
  const violations = review ? review.violations : draft.violations;
  const staleIds = review?.staleIds ?? NO_STALE_IDS;

  const index = useMemo(() => indexGraph(graph), [graph]);
  const context = useMemo(() => ({ index, items, ability }), [index, items, ability]);
  const nodes = useMemo(() => {
    if (!isActive) {
      return layout.nodes;
    }

    const drafted = withDraftNodeData(layout.nodes, index, overlayItems, violations, isEditing);

    return review ? withReviewMarks(drafted, items, staleIds) : drafted;
  }, [isActive, layout.nodes, index, overlayItems, violations, isEditing, review, items, staleIds]);
  const edges = useMemo(
    () =>
      withStaleEdges(
        withEdgePermissions(
          applyDraftToGraph(graph.edges, overlayItems),
          context,
          isEditing,
          selectedLinkId,
        ),
        staleIds,
      ),
    [graph.edges, overlayItems, context, isEditing, selectedLinkId, staleIds],
  );
  const changes = useMemo(
    () => getDraftChanges(items, index, violations),
    [items, index, violations],
  );
  const draftEditing = useDraftCanvasHandlers({
    context,
    isEditable: isEditing,
    onItemsChange: draft.changeItems,
  });
  const notice = isActive && selection ? getDraftNotice(selection, { ...context, graph }) : null;
  const reviewChange = notice
    ? review?.changes?.find(({ subordinateId }) => subordinateId === notice.subordinateId)
    : undefined;

  const handleRemoveChange = (subordinateId: string) =>
    draft.changeItems(removeChange(items, subordinateId));
  const handleRemoveLink = (subordinateId: string) =>
    draft.changeItems(stageChange(items, index, subordinateId, null));
  const handleClear = () => {
    clearSelection();
    draft.closeChangesSheet();
  };

  let idleContent: ReactNode = null;
  let selectionExtra: ReactNode = null;

  if (review) {
    idleContent = <DraftReviewPanel review={review} onSelectPerson={focusPerson} />;
  } else if (isActive) {
    idleContent = (
      <DraftChangesPanel
        draft={draft}
        changes={changes}
        onSelectPerson={focusPerson}
        onRemoveChange={handleRemoveChange}
      />
    );
  }

  if (reviewChange) {
    selectionExtra = <ReviewChangeNotice change={reviewChange} />;
  } else if (notice && !review) {
    selectionExtra = (
      <DraftChangeNotice
        notice={notice}
        isEditable={isEditing}
        onUndo={handleRemoveChange}
        onRemoveLink={handleRemoveLink}
      />
    );
  }

  return (
    <div className="flex min-h-96 flex-1">
      <div className="min-w-0 flex-1">
        <MentorshipGraphCanvas
          nodes={nodes}
          edges={edges}
          selectedPersonId={selectedPersonId}
          selectedLinkId={selectedLinkId}
          onSelectionChange={handleSelectionChange}
          draftEditing={draftEditing}
        >
          {review ? <DraftReadOnlyHint status={review.detail.status} /> : null}
        </MentorshipGraphCanvas>
      </div>
      <GraphSidePanel
        graph={graph}
        selection={selection}
        isCompact={isCompact}
        onSelectPerson={focusPerson}
        onOpen={revealSelectedPerson}
        onClear={handleClear}
        isIdleSheetOpen={draft.isChangesSheetOpen}
        idleContent={idleContent}
        selectionExtra={selectionExtra}
      />
    </div>
  );
};

export default MentorshipGraphWorkspace;
