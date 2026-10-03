import { ReactNode, TransitionEvent } from "react";

import { cn } from "@/lib/utils";
import GraphPanelCloseButton from "@/modules/graph/components/GraphPanelCloseButton";
import LinkDetails from "@/modules/graph/components/LinkDetails";
import PersonDetails from "@/modules/graph/components/PersonDetails";
import { EGraphSelectionKind } from "@/modules/graph/graph.enums";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/components/shadui/drawer";

import { GRAPH_SIDE_PANEL_LABEL, PANEL_SLIDE_PROPERTY } from "./GraphSidePanel.constants";
import { getLinkDetails, getPersonDetails } from "./GraphSidePanel.helpers";
import { useDisplayedSelection } from "./GraphSidePanel.hooks";
import { IGraphSidePanelProps } from "./GraphSidePanel.interfaces";

const GraphSidePanel = ({
  graph,
  selection,
  isCompact,
  onSelectPerson,
  onOpen,
  onClear,
}: IGraphSidePanelProps) => {
  const displayed = useDisplayedSelection(selection);
  const personDetails =
    displayed?.kind === EGraphSelectionKind.PERSON ? getPersonDetails(graph, displayed.id) : null;
  const linkDetails =
    displayed?.kind === EGraphSelectionKind.LINK ? getLinkDetails(graph, displayed.id) : null;

  let content: ReactNode = null;

  if (personDetails) {
    content = <PersonDetails details={personDetails} onSelectPerson={onSelectPerson} />;
  } else if (linkDetails) {
    content = <LinkDetails details={linkDetails} onSelectPerson={onSelectPerson} />;
  }

  const isOpen = selection !== null && content !== null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClear();
    }
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLElement>) => {
    if (
      isOpen &&
      event.target === event.currentTarget &&
      event.propertyName === PANEL_SLIDE_PROPERTY
    ) {
      onOpen();
    }
  };

  return (
    <>
      <aside
        aria-label={GRAPH_SIDE_PANEL_LABEL}
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "hidden shrink-0 overflow-hidden bg-background transition-[width,visibility] duration-200 ease-out motion-reduce:transition-none min-[53.75rem]:block",
          isOpen ? "visible w-80 border-l" : "invisible w-0",
        )}
      >
        <div className="relative h-full w-80 overflow-y-auto">
          <GraphPanelCloseButton onClose={onClear} />
          {content}
        </div>
      </aside>
      <Drawer open={isCompact && isOpen} onOpenChange={handleOpenChange} modal={false}>
        <DrawerContent>
          <DrawerTitle className="sr-only">{GRAPH_SIDE_PANEL_LABEL}</DrawerTitle>
          <div className="relative overflow-y-auto">
            <GraphPanelCloseButton onClose={onClear} />
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GraphSidePanel;
