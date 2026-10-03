import GraphSidePanel from "@/modules/graph/components/GraphSidePanel";
import MentorshipGraphCanvas from "@/modules/graph/components/MentorshipGraphCanvas";

import { useGraphSelection, useIsCompactGraph } from "./MentorshipGraphWorkspace.hooks";
import { IMentorshipGraphWorkspaceProps } from "./MentorshipGraphWorkspace.interfaces";

const MentorshipGraphWorkspace = ({ graph, layout }: IMentorshipGraphWorkspaceProps) => {
  const isCompact = useIsCompactGraph();
  const {
    selection,
    selectedPersonId,
    selectedLinkId,
    handleSelectionChange,
    focusPerson,
    revealSelectedPerson,
    clearSelection,
  } = useGraphSelection();

  return (
    <div className="flex min-h-96 flex-1">
      <div className="min-w-0 flex-1">
        <MentorshipGraphCanvas
          layout={layout}
          selectedPersonId={selectedPersonId}
          selectedLinkId={selectedLinkId}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <GraphSidePanel
        graph={graph}
        selection={selection}
        isCompact={isCompact}
        onSelectPerson={focusPerson}
        onOpen={revealSelectedPerson}
        onClear={clearSelection}
      />
    </div>
  );
};

export default MentorshipGraphWorkspace;
