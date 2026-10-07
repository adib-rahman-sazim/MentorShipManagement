import { cn } from "@/lib/utils";
import {
  TREE_NODE_DELAY_CLASSES,
  TREE_NODE_HEIGHT_CLASS,
  TREE_PROPOSED_NODE_DELAY_CLASS,
} from "@/modules/home/home.constants";
import { getInitials } from "@/shared/utils/string";

import { PROPOSED_OPERATION_DETAILS } from "./MentorshipTreeNode.constants";
import { getPreviewPersonMeta } from "./MentorshipTreeNode.helpers";
import type { IMentorshipTreeNodeProps } from "./MentorshipTreeNode.interfaces";

const MentorshipTreeNode = ({ person, depth }: IMentorshipTreeNodeProps) => (
  <div className="flex w-full justify-center px-1">
    <div
      className={cn(
        "relative flex w-full max-w-40 items-center gap-2 rounded-lg bg-card px-2.5 text-card-foreground shadow-xs ring-1 ring-foreground/10 motion-safe:animate-home-pop",
        TREE_NODE_HEIGHT_CLASS,
        person.isProposed ? TREE_PROPOSED_NODE_DELAY_CLASS : TREE_NODE_DELAY_CLASSES[depth],
      )}
    >
      <span className="hidden size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[0.625rem] font-medium sm:flex">
        {getInitials(person.name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.8125rem] leading-4.5 font-medium">{person.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {getPreviewPersonMeta(person, depth)}
        </span>
      </span>
      {person.isProposed ? (
        <span
          title={PROPOSED_OPERATION_DETAILS.word}
          className={cn(
            "absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border font-mono text-xs font-semibold",
            PROPOSED_OPERATION_DETAILS.badgeClassName,
          )}
        >
          {PROPOSED_OPERATION_DETAILS.glyph}
        </span>
      ) : null}
    </div>
  </div>
);

export default MentorshipTreeNode;
