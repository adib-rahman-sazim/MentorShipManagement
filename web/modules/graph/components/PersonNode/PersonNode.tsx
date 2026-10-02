import { memo } from "react";

import { Handle, NodeProps, Position } from "@xyflow/react";

import { cn } from "@/lib/utils";
import type { TPersonNode } from "@/modules/graph/graph.types";
import { EUserState } from "@/shared/typedefs";
import { getInitials } from "@/shared/utils/string";

import { getPersonMeta } from "./PersonNode.helpers";

const PersonNode = ({ data, selected }: NodeProps<TPersonNode>) => (
  <div
    className={cn(
      "flex h-14 w-40 items-center gap-2 rounded-lg bg-card px-2.5 text-card-foreground shadow-xs ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/30",
      {
        "ring-2 ring-focus hover:ring-focus": selected,
        "opacity-60": data.state === EUserState.INACTIVE,
      },
    )}
  >
    <Handle type="target" position={Position.Top} isConnectable={false} className="invisible" />
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-[0.625rem] font-medium">
      {getInitials(data.name)}
    </span>
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-[0.8125rem] leading-4.5 font-medium" title={data.name}>
        {data.name}
      </span>
      <span className="truncate text-xs text-muted-foreground">{getPersonMeta(data)}</span>
    </span>
    <Handle type="source" position={Position.Bottom} isConnectable={false} className="invisible" />
  </div>
);

export default memo(PersonNode);
