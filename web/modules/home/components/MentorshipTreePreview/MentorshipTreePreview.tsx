import pluralize from "pluralize";

import { cn } from "@/lib/utils";
import MentorshipTreeBranch from "@/modules/home/components/MentorshipTreeBranch";
import { TREE_NODE_HEIGHT_CLASS, TREE_TIER_GAP_CLASS } from "@/modules/home/home.constants";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";

import {
  LIVE_LEGEND_LABEL,
  PREVIEW_ARIA_LABEL,
  PREVIEW_TIER_ROLES,
  PREVIEW_TREE,
  PROPOSED_LEGEND_LABEL,
} from "./MentorshipTreePreview.constants";
import { getTierCounts } from "./MentorshipTreePreview.helpers";

const MentorshipTreePreview = () => {
  const tierCounts = getTierCounts(PREVIEW_TREE);

  return (
    <figure className="rounded-2xl border bg-muted/60 p-1.5 motion-safe:animate-home-rise [animation-delay:120ms]">
      <div className="rounded-[calc(var(--radius-2xl)-0.375rem)] border bg-canvas bg-[radial-gradient(var(--dot)_0.0625rem,transparent_0.0625rem)] bg-size-[1.25rem_1.25rem] px-3 pt-8 pb-6 sm:px-6 sm:pt-14 2xl:px-10 2xl:pt-16 2xl:pb-8">
        <div role="img" aria-label={PREVIEW_ARIA_LABEL} className="relative">
          <ul
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 hidden flex-col sm:flex",
              TREE_TIER_GAP_CLASS,
            )}
          >
            {PREVIEW_TIER_ROLES.map((role, depth) => (
              <li key={role} className={cn("relative", TREE_NODE_HEIGHT_CLASS)}>
                <span className="absolute bottom-full left-1 mb-2 flex gap-1 text-xs whitespace-nowrap text-muted-foreground">
                  {pluralize(USER_ROLE_LABELS[role])}
                  <span className="font-mono">{tierCounts[depth] ?? 0}</span>
                </span>
              </li>
            ))}
          </ul>
          <MentorshipTreeBranch person={PREVIEW_TREE} depth={0} />
        </div>
        <figcaption className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span aria-hidden className="w-5 border-t-[0.09375rem] border-edge" />
            {LIVE_LEGEND_LABEL}
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="w-5 border-t-[0.09375rem] border-dashed border-op-assign"
            />
            {PROPOSED_LEGEND_LABEL}
          </span>
        </figcaption>
      </div>
    </figure>
  );
};

export default MentorshipTreePreview;
