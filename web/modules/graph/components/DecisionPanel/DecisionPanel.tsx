import { useId } from "react";

import CancelDraftDialog from "@/modules/graph/components/CancelDraftDialog";
import ConflictNotice from "@/modules/graph/components/ConflictNotice";
import PublishConfirm from "@/modules/graph/components/PublishConfirm";
import { DECISION_COMMENT_MAX_LENGTH } from "@/modules/graph/decision.constants";
import { getDecisionBlock } from "@/modules/graph/decision.helpers";
import { Button } from "@/shared/components/shadui/button";
import { Label } from "@/shared/components/shadui/label";
import { Textarea } from "@/shared/components/shadui/textarea";
import { useAuth } from "@/shared/providers/AuthProvider";

import {
  DECISION_NOTE_LABEL,
  DECISION_NOTE_PLACEHOLDER,
  DECISION_PANEL_LABEL,
  OPTIONAL_LABEL,
  REJECT_LABEL,
} from "./DecisionPanel.constants";
import { getApproveLabel, getDecisionOptions } from "./DecisionPanel.helpers";
import { IDecisionPanelProps } from "./DecisionPanel.interfaces";

const DecisionPanel = ({
  review,
  decisions,
  canStartNewDraft,
  onStartNewDraft,
  onSelectPerson,
}: IDecisionPanelProps) => {
  const { user } = useAuth();
  const noteId = useId();
  const { detail, changes } = review;
  const { conflict, isBusy } = decisions;
  const { canApprove, canReject, canPublish, canCancel } = getDecisionOptions(detail);
  const canDecide = canApprove || canReject;
  const blockedText = getDecisionBlock(detail, user?.id ?? null);

  if (!conflict && !canDecide && !canPublish && !canCancel && !blockedText) {
    return null;
  }

  return (
    <section aria-label={DECISION_PANEL_LABEL} className="flex flex-col gap-3 border-t pt-4">
      {conflict ? (
        <ConflictNotice
          conflict={conflict}
          changes={changes}
          canStartNewDraft={canStartNewDraft}
          onStartNewDraft={onStartNewDraft}
          onSelectPerson={onSelectPerson}
        />
      ) : null}
      {canDecide ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={noteId}>
            {DECISION_NOTE_LABEL}
            <span className="font-normal text-muted-foreground">{OPTIONAL_LABEL}</span>
          </Label>
          <Textarea
            id={noteId}
            value={decisions.note}
            placeholder={DECISION_NOTE_PLACEHOLDER}
            maxLength={DECISION_COMMENT_MAX_LENGTH}
            disabled={isBusy}
            onChange={(event) => decisions.setNote(event.target.value)}
          />
        </div>
      ) : null}
      {canDecide ? (
        <div className="flex gap-2">
          {canReject ? (
            <Button variant="destructive" disabled={isBusy} onClick={() => decisions.reject()}>
              {REJECT_LABEL}
            </Button>
          ) : null}
          {canApprove ? (
            <Button className="flex-1" disabled={isBusy} onClick={() => decisions.approve()}>
              {getApproveLabel(detail.itemCount)}
            </Button>
          ) : null}
        </div>
      ) : null}
      {canPublish ? (
        <PublishConfirm
          changes={changes}
          changeCount={detail.itemCount}
          isBusy={isBusy}
          onConfirm={decisions.publish}
        />
      ) : null}
      {blockedText ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          {blockedText}
        </p>
      ) : null}
      {canCancel ? <CancelDraftDialog isBusy={isBusy} onConfirm={decisions.cancel} /> : null}
    </section>
  );
};

export default DecisionPanel;
