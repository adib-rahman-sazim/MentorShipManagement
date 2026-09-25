import { formatUnsavedChangesLabel } from "@/modules/users/permissions/permissions.helpers";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/shadui/button";

import { DISCARD_LABEL, SAVE_LABEL, SAVING_LABEL } from "./UnsavedChangesBar.constants";
import { IUnsavedChangesBarProps } from "./UnsavedChangesBar.interfaces";

const UnsavedChangesBar = ({ form, pendingChangeCount, onDiscard }: IUnsavedChangesBarProps) => {
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="sticky bottom-4 z-10 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium" aria-live="polite">
          {formatUnsavedChangesLabel(pendingChangeCount)}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDiscard} disabled={isSubmitting}>
            {DISCARD_LABEL}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner className="text-primary-foreground" /> : null}
            {isSubmitting ? SAVING_LABEL : SAVE_LABEL}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
