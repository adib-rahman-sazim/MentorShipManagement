import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/shared/components/shadui/dropdown-menu";

import { WAITING_ON_YOU_TEXT } from "./ReviewDraftsMenuItem.constants";
import { IReviewDraftsMenuItemProps } from "./ReviewDraftsMenuItem.interfaces";

const ReviewDraftsMenuItem = ({ entry, onSelect }: IReviewDraftsMenuItemProps) => (
  <DropdownMenuItem className="items-start gap-2 py-2" onClick={() => onSelect(entry.id)}>
    <span
      aria-hidden
      className={cn(
        "mt-1.5 size-1.5 shrink-0 rounded-full",
        entry.isWaiting ? "bg-status-review-fg" : "bg-transparent",
      )}
    />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-medium">{entry.title}</span>
      <span className="truncate text-xs text-muted-foreground">{entry.meta}</span>
      {entry.isWaiting ? <span className="sr-only">{WAITING_ON_YOU_TEXT}</span> : null}
    </span>
  </DropdownMenuItem>
);

export default ReviewDraftsMenuItem;
