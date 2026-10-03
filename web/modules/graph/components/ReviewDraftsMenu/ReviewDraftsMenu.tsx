import { Fragment, useState } from "react";

import { ChevronDown, ListChecks } from "lucide-react";

import ReviewDraftsMenuItem from "@/modules/graph/components/ReviewDraftsMenuItem";
import { buttonVariants } from "@/shared/components/shadui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/shadui/dropdown-menu";

import { REVIEW_DRAFTS_LABEL } from "./ReviewDraftsMenu.constants";
import {
  getMenuStatusText,
  getShowAllLabel,
  getWaitingBadgeLabel,
} from "./ReviewDraftsMenu.helpers";
import { useReviewDraftGroups } from "./ReviewDraftsMenu.hooks";
import { IReviewDraftsMenuProps } from "./ReviewDraftsMenu.interfaces";

const ReviewDraftsMenu = ({ onOpenDraft }: IReviewDraftsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { groups, waitingBadge, isLoading, showAll } = useReviewDraftGroups(isOpen);
  const visibleGroups = groups.filter(({ entries }) => entries.length > 0);
  const statusText = getMenuStatusText(isLoading, visibleGroups.length > 0);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label={REVIEW_DRAFTS_LABEL}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <ListChecks />
        <span className="hidden sm:inline">{REVIEW_DRAFTS_LABEL}</span>
        {waitingBadge ? (
          <span
            title={getWaitingBadgeLabel(waitingBadge)}
            className="rounded-full bg-status-review-fg px-1.5 font-mono text-[0.6875rem] leading-4.5 text-background"
          >
            {waitingBadge}
          </span>
        ) : null}
        <ChevronDown className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(20rem,calc(100vw-2rem))]">
        {statusText ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">{statusText}</p>
        ) : null}
        {visibleGroups.map(({ group, label, entries, total, canShowAll }, index) => (
          <Fragment key={group}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex justify-between">
                {label}
                <span className="font-mono">{total}</span>
              </DropdownMenuLabel>
              {entries.map((entry) => (
                <ReviewDraftsMenuItem key={entry.id} entry={entry} onSelect={onOpenDraft} />
              ))}
              {canShowAll ? (
                <DropdownMenuItem
                  closeOnClick={false}
                  className="text-xs text-muted-foreground"
                  onClick={() => showAll(group)}
                >
                  {getShowAllLabel(total)}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReviewDraftsMenu;
