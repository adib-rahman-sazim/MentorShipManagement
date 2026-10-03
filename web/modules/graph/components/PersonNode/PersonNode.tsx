import { memo } from "react";

import { Handle, NodeProps, Position } from "@xyflow/react";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { DRAFT_OPERATION_DETAILS } from "@/modules/graph/draft.constants";
import type { TPersonNode } from "@/modules/graph/graph.types";
import { STALE_CHANGE_LABEL } from "@/modules/graph/review.constants";
import { EUserState } from "@/shared/typedefs";
import { getInitials } from "@/shared/utils/string";

import { DRAFT_HANDLE_CLASS } from "./PersonNode.constants";
import { getPersonMeta } from "./PersonNode.helpers";

const PersonNode = ({ data, selected }: NodeProps<TPersonNode>) => {
  const isTargetConnectable = data.draft?.isTargetConnectable ?? false;
  const isSourceConnectable = data.draft?.isSourceConnectable ?? false;
  const operation = data.draft?.operation ?? null;
  const operationDetails = operation ? DRAFT_OPERATION_DETAILS[operation] : null;

  return (
    <div
      className={cn(
        "relative flex h-14 w-40 items-center gap-2 rounded-lg bg-card px-2.5 text-card-foreground shadow-xs ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/30",
        {
          "ring-2 ring-destructive hover:ring-destructive": selected || data.draft?.hasViolation,
          "opacity-60": data.state === EUserState.INACTIVE,
        },
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isTargetConnectable}
        className={cn(DRAFT_HANDLE_CLASS, { invisible: !isTargetConnectable })}
      />
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[0.625rem] font-medium">
        {getInitials(data.name)}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[0.8125rem] leading-4.5 font-medium" title={data.name}>
          {data.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">{getPersonMeta(data)}</span>
      </span>
      {operationDetails ? (
        <span
          title={operationDetails.word}
          className={cn(
            "absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border font-mono text-xs font-semibold",
            operationDetails.badgeClassName,
          )}
        >
          {operationDetails.glyph}
        </span>
      ) : null}
      {data.draft?.isStale ? (
        <span
          title={STALE_CHANGE_LABEL}
          className="absolute -top-2 -left-2 flex size-5 items-center justify-center rounded-full border border-destructive/40 bg-background text-destructive"
        >
          <TriangleAlert aria-hidden className="size-3" />
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isSourceConnectable}
        className={cn(DRAFT_HANDLE_CLASS, { invisible: !isSourceConnectable })}
      />
    </div>
  );
};

export default memo(PersonNode);
