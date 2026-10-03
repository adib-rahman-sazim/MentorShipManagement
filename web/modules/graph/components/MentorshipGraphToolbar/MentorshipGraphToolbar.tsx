import { Plus } from "lucide-react";

import { Button } from "@/shared/components/shadui/button";
import { SidebarTrigger } from "@/shared/components/shadui/sidebar";

import { GRAPH_TITLE, NEW_DRAFT_LABEL } from "./MentorshipGraphToolbar.constants";
import { IMentorshipGraphToolbarProps } from "./MentorshipGraphToolbar.interfaces";

const MentorshipGraphToolbar = ({ canCreateDraft, onNewDraft }: IMentorshipGraphToolbarProps) => (
  <header className="flex h-13 shrink-0 items-center gap-2 border-b bg-background pr-5">
    <SidebarTrigger />
    <h1 className="text-sm font-medium">{GRAPH_TITLE}</h1>
    {canCreateDraft ? (
      <Button size="sm" className="ml-auto" onClick={onNewDraft}>
        <Plus />
        {NEW_DRAFT_LABEL}
      </Button>
    ) : null}
  </header>
);

export default MentorshipGraphToolbar;
