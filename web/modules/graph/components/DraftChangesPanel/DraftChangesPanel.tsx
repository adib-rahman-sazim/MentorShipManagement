import DraftChangeRow from "@/modules/graph/components/DraftChangeRow";
import { DRAFT_TITLE_MAX_LENGTH, UNTITLED_DRAFT_LABEL } from "@/modules/graph/draft.constants";
import { Button } from "@/shared/components/shadui/button";
import { Input } from "@/shared/components/shadui/input";
import { Label } from "@/shared/components/shadui/label";

import {
  CHANGES_HEADING,
  NO_CHANGES_EDITABLE_TEXT,
  NO_CHANGES_TEXT,
  READ_ONLY_TEXT,
  SAVE_DRAFT_LABEL,
  SAVED_TEXT,
  TITLE_INPUT_ID,
  TITLE_LABEL,
  UNSAVED_TEXT,
} from "./DraftChangesPanel.constants";
import { getSubmitLabel } from "./DraftChangesPanel.helpers";
import { IDraftChangesPanelProps } from "./DraftChangesPanel.interfaces";

const DraftChangesPanel = ({
  draft,
  changes,
  onSelectPerson,
  onRemoveChange,
}: IDraftChangesPanelProps) => {
  const { title, isEditable, isDirty, isSaving, isSubmitting } = draft;
  const hasTitle = title.trim().length > 0;
  const isBusy = isSaving || isSubmitting;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={TITLE_INPUT_ID}>{TITLE_LABEL}</Label>
        <Input
          id={TITLE_INPUT_ID}
          value={title}
          placeholder={UNTITLED_DRAFT_LABEL}
          maxLength={DRAFT_TITLE_MAX_LENGTH}
          disabled={!isEditable}
          onChange={(event) => draft.setTitle(event.target.value)}
        />
      </div>
      <section>
        <div className="mb-1 flex items-baseline gap-2">
          <h2 className="text-sm font-medium">{CHANGES_HEADING}</h2>
          <span className="font-mono text-xs text-muted-foreground">{changes.length}</span>
        </div>
        {changes.length > 0 ? (
          <ul className="divide-y">
            {changes.map((change) => (
              <li key={change.subordinateId}>
                <DraftChangeRow
                  change={change}
                  isEditable={isEditable}
                  onSelect={onSelectPerson}
                  onRemove={onRemoveChange}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.8125rem] text-muted-foreground">
            {isEditable ? NO_CHANGES_EDITABLE_TEXT : NO_CHANGES_TEXT}
          </p>
        )}
      </section>
      {isEditable ? (
        <div className="flex flex-col gap-3 border-t pt-4">
          <Button
            disabled={changes.length === 0 || !hasTitle || isBusy}
            onClick={() => draft.submit()}
          >
            {getSubmitLabel(changes.length)}
          </Button>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {isDirty ? UNSAVED_TEXT : SAVED_TEXT}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!isDirty || !hasTitle || isBusy}
              onClick={() => draft.save()}
            >
              {SAVE_DRAFT_LABEL}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{READ_ONLY_TEXT}</p>
      )}
    </div>
  );
};

export default DraftChangesPanel;
