import { cn } from "@/lib/utils";
import { DRAFT_OPERATION_DETAILS } from "@/modules/graph/draft.constants";

import { IDraftOperationBadgeProps } from "./DraftOperationBadge.interfaces";

const DraftOperationBadge = ({ operation }: IDraftOperationBadgeProps) => {
  const details = DRAFT_OPERATION_DETAILS[operation];

  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold",
        details.badgeClassName,
      )}
    >
      {details.glyph}
    </span>
  );
};

export default DraftOperationBadge;
