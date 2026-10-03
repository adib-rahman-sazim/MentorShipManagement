import { Plus, TriangleAlert } from "lucide-react";

import DraftChangeAlerts from "@/modules/graph/components/DraftChangeAlerts";
import DraftChangeRow from "@/modules/graph/components/DraftChangeRow";
import { Button } from "@/shared/components/shadui/button";

import { CONFLICT_DESCRIPTIONS, START_NEW_DRAFT_LABEL } from "./ConflictNotice.constants";
import { getConflictChanges, getConflictTitle } from "./ConflictNotice.helpers";
import { IConflictNoticeProps } from "./ConflictNotice.interfaces";

const ConflictNotice = ({
  conflict,
  changes,
  canStartNewDraft,
  onStartNewDraft,
  onSelectPerson,
}: IConflictNoticeProps) => {
  const conflictChanges = getConflictChanges(conflict, changes);

  return (
    <section
      role="alert"
      className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3"
    >
      <h2 className="flex items-start gap-1.5 text-sm font-medium text-destructive">
        <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {getConflictTitle(conflict)}
      </h2>
      <p className="text-xs text-muted-foreground">{CONFLICT_DESCRIPTIONS[conflict.action]}</p>
      {conflictChanges.length > 0 ? (
        <ul className="divide-y border-y border-destructive/20">
          {conflictChanges.map((change) => (
            <li key={change.subordinateId}>
              <DraftChangeRow change={change} isEditable={false} onSelect={onSelectPerson}>
                <DraftChangeAlerts change={change} />
              </DraftChangeRow>
            </li>
          ))}
        </ul>
      ) : null}
      {canStartNewDraft ? (
        <Button variant="outline" size="sm" className="self-start" onClick={onStartNewDraft}>
          <Plus />
          {START_NEW_DRAFT_LABEL}
        </Button>
      ) : null}
    </section>
  );
};

export default ConflictNotice;
