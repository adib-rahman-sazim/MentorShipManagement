import { useMemo } from "react";

import DraftChangeNotice from "@/modules/graph/components/DraftChangeNotice";
import DraftChangesPanel from "@/modules/graph/components/DraftChangesPanel";
import GraphSidePanel from "@/modules/graph/components/GraphSidePanel";
import MentorshipGraphCanvas from "@/modules/graph/components/MentorshipGraphCanvas";
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
import { useAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";

import { NO_DRAFT_ITEMS } from "./MentorshipGraphWorkspace.constants";
import {
  useDraftCanvasHandlers,
  useGraphSelection,
  useIsCompactGraph,
} from "./MentorshipGraphWorkspace.hooks";
import { IMentorshipGraphWorkspaceProps } from "./MentorshipGraphWorkspace.interfaces";

const MentorshipGraphWorkspace = ({ graph, layout, draft }: IMentorshipGraphWorkspaceProps) => {
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
  const { isActive, isEditable, violations } = draft;
  const items = isActive ? draft.items : NO_DRAFT_ITEMS;
  const isEditing = isActive && isEditable;

  const index = useMemo(() => indexGraph(graph), [graph]);
  const context = useMemo(() => ({ index, items, ability }), [index, items, ability]);
  const nodes = useMemo(
    () =>
      isActive
        ? withDraftNodeData(layout.nodes, index, items, violations, isEditing)
        : layout.nodes,
    [isActive, layout.nodes, index, items, violations, isEditing],
  );
  const edges = useMemo(
    () =>
      withEdgePermissions(
        applyDraftToGraph(graph.edges, items),
        context,
        isEditing,
        selectedLinkId,
      ),
    [graph.edges, items, context, isEditing, selectedLinkId],
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

  const handleRemoveChange = (subordinateId: string) =>
    draft.changeItems(removeChange(items, subordinateId));
  const handleRemoveLink = (subordinateId: string) =>
    draft.changeItems(stageChange(items, index, subordinateId, null));
  const handleClear = () => {
    clearSelection();
    draft.closeChangesSheet();
  };

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
        />
      </div>
      <GraphSidePanel
        graph={graph}
        selection={selection}
        isCompact={isCompact}
        onSelectPerson={focusPerson}
        onOpen={revealSelectedPerson}
        onClear={handleClear}
        isIdleSheetOpen={draft.isChangesSheetOpen}
        idleContent={
          isActive ? (
            <DraftChangesPanel
              draft={draft}
              changes={changes}
              onSelectPerson={focusPerson}
              onRemoveChange={handleRemoveChange}
            />
          ) : null
        }
        selectionExtra={
          notice ? (
            <DraftChangeNotice
              notice={notice}
              isEditable={isEditing}
              onUndo={handleRemoveChange}
              onRemoveLink={handleRemoveLink}
            />
          ) : null
        }
      />
    </div>
  );
};

export default MentorshipGraphWorkspace;
