import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DRAFT_OPERATION_DETAILS } from "@/modules/graph/draft.constants";
import { Button } from "@/shared/components/shadui/button";

import { getRemoveChangeLabel } from "./DraftChangeRow.helpers";
import { IDraftChangeRowProps } from "./DraftChangeRow.interfaces";

const DraftChangeRow = ({ change, isEditable, onSelect, onRemove }: IDraftChangeRowProps) => {
  const details = DRAFT_OPERATION_DETAILS[change.operation];
  const removeLabel = getRemoveChangeLabel(change.name);

  return (
    <div className="flex items-start gap-2 py-2">
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold",
          details.badgeClassName,
        )}
      >
        {details.glyph}
      </span>
      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-focus"
        onClick={() => onSelect(change.subordinateId)}
      >
        <span className="truncate text-sm font-medium">
          {change.name}
          <span className="font-normal text-muted-foreground"> · {change.roleLabel}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          <span className={details.textClassName}>{details.word}</span> · {change.fromName} →{" "}
          {change.toName}
        </span>
        {change.violations.map((violation) => (
          <span key={violation} className="text-xs text-destructive">
            {violation}
          </span>
        ))}
      </button>
      {isEditable ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label={removeLabel}
          title={removeLabel}
          onClick={() => onRemove(change.subordinateId)}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
};

export default DraftChangeRow;
