import StatusLozenge from "@/modules/graph/components/StatusLozenge";
import {
  DRAFT_OPERATION_DETAILS,
  DRAFT_OPERATION_ORDER,
  UNTITLED_DRAFT_LABEL,
} from "@/modules/graph/draft.constants";
import { Button } from "@/shared/components/shadui/button";
import { SidebarTrigger } from "@/shared/components/shadui/sidebar";

import { CHANGES_BUTTON_LABEL, EXIT_DRAFT_LABEL, LIVE_UNCHANGED_TEXT } from "./DraftBar.constants";
import { IDraftBarProps } from "./DraftBar.interfaces";

const DraftBar = ({
  title,
  status,
  counts,
  changeCount,
  onOpenChanges,
  onExit,
}: IDraftBarProps) => (
  <header className="flex min-h-13 shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b bg-background py-2 pr-5">
    <SidebarTrigger />
    <StatusLozenge status={status} />
    <h1 className="min-w-0 truncate text-sm font-medium" title={title}>
      {title.trim() || UNTITLED_DRAFT_LABEL}
    </h1>
    <p className="hidden text-xs text-muted-foreground lg:block">{LIVE_UNCHANGED_TEXT}</p>
    <div className="ml-auto flex items-center gap-3">
      <span className="flex gap-2 font-mono text-xs">
        {DRAFT_OPERATION_ORDER.map((operation) => (
          <span key={operation} className={DRAFT_OPERATION_DETAILS[operation].textClassName}>
            {DRAFT_OPERATION_DETAILS[operation].glyph}
            {counts[operation]}
          </span>
        ))}
      </span>
      <Button variant="outline" size="sm" className="min-[53.75rem]:hidden" onClick={onOpenChanges}>
        {CHANGES_BUTTON_LABEL} {changeCount}
      </Button>
      <Button variant="ghost" size="sm" onClick={onExit}>
        {EXIT_DRAFT_LABEL}
      </Button>
    </div>
  </header>
);

export default DraftBar;
