import type { FinalConnectionState } from "@xyflow/react";

import type { TDraftConnection } from "@/modules/graph/draft.types";

export function getDroppedConnection({
  isValid,
  fromNode,
  fromHandle,
  toNode,
}: FinalConnectionState): TDraftConnection | null {
  if (isValid !== false || !fromNode || !fromHandle || !toNode) {
    return null;
  }

  return fromHandle.type === "source"
    ? { source: fromNode.id, target: toNode.id }
    : { source: toNode.id, target: fromNode.id };
}
