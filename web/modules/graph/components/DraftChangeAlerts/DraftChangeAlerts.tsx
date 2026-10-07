import { TriangleAlert } from "lucide-react";

import { getChangedByText, getOverlapText, getStaleText } from "./DraftChangeAlerts.helpers";
import { useChangedByDraft } from "./DraftChangeAlerts.hooks";
import { IDraftChangeAlertsProps } from "./DraftChangeAlerts.interfaces";

const DraftChangeAlerts = ({ change }: IDraftChangeAlertsProps) => {
  const changedBy = useChangedByDraft(change.stale?.changedByDraftId ?? null);

  return (
    <>
      {change.stale ? (
        <span className="flex items-start gap-1 text-xs text-destructive">
          <TriangleAlert aria-hidden className="mt-0.5 size-3 shrink-0" />
          <span>
            {getStaleText(change.stale)} {getChangedByText(change.stale, changedBy)}
          </span>
        </span>
      ) : null}
      {change.overlaps.map((overlap) => (
        <span key={overlap.id} className="text-xs text-muted-foreground">
          {getOverlapText(overlap)}
        </span>
      ))}
    </>
  );
};

export default DraftChangeAlerts;
