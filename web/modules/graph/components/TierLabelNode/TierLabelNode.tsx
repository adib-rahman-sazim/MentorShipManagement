import { memo } from "react";

import { NodeProps } from "@xyflow/react";
import pluralize from "pluralize";

import type { TTierLabelNode } from "@/modules/graph/graph.types";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";

const TierLabelNode = ({ data }: NodeProps<TTierLabelNode>) => (
  <span className="flex gap-1 text-xs whitespace-nowrap text-muted-foreground">
    {pluralize(USER_ROLE_LABELS[data.role])}
    <span className="font-mono">{data.count}</span>
  </span>
);

export default memo(TierLabelNode);
