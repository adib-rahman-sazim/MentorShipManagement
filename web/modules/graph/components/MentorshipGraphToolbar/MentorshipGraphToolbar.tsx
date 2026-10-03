import { Plus } from "lucide-react";

import ReviewDraftsMenu from "@/modules/graph/components/ReviewDraftsMenu";
import { Button } from "@/shared/components/shadui/button";
import { SidebarTrigger } from "@/shared/components/shadui/sidebar";

import { GRAPH_TITLE, NEW_DRAFT_LABEL } from "./MentorshipGraphToolbar.constants";
import { IMentorshipGraphToolbarProps } from "./MentorshipGraphToolbar.interfaces";

const MentorshipGraphToolbar = ({
  canCreateDraft,
  canReadDrafts,
  onNewDraft,
  onOpenDraft,
}: IMentorshipGraphToolbarProps) => (
  <header className="flex h-13 shrink-0 items-center gap-2 border-b bg-background pr-5">
    <SidebarTrigger />
    <h1 className="min-w-0 truncate text-sm font-medium">{GRAPH_TITLE}</h1>
    <div className="ml-auto flex items-center gap-2">
      {canReadDrafts ? <ReviewDraftsMenu onOpenDraft={onOpenDraft} /> : null}
      {canCreateDraft ? (
        <Button size="sm" onClick={onNewDraft}>
          <Plus />
          {NEW_DRAFT_LABEL}
        </Button>
      ) : null}
    </div>
  </header>
);

export default MentorshipGraphToolbar;
