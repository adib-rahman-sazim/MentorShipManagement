import { cn } from "@/lib/utils";
import { DRAFT_STATUS_LABELS } from "@/modules/graph/draft.constants";

import { STATUS_LOZENGE_CLASSES, STATUS_LOZENGE_ICONS } from "./StatusLozenge.constants";
import { IStatusLozengeProps } from "./StatusLozenge.interfaces";

const StatusLozenge = ({ status }: IStatusLozengeProps) => {
  const Icon = STATUS_LOZENGE_ICONS[status];

  return (
    <span
      className={cn(
        "inline-flex h-5.5 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium",
        STATUS_LOZENGE_CLASSES[status],
      )}
    >
      <Icon aria-hidden className="size-3" />
      {DRAFT_STATUS_LABELS[status]}
    </span>
  );
};

export default StatusLozenge;
