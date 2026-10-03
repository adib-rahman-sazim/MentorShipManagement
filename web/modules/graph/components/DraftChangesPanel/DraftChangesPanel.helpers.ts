import pluralize from "pluralize";

import { SUBMIT_EMPTY_LABEL, SUBMIT_NOUN } from "./DraftChangesPanel.constants";

export function getSubmitLabel(changeCount: number): string {
  return changeCount === 0
    ? SUBMIT_EMPTY_LABEL
    : `Submit ${pluralize(SUBMIT_NOUN, changeCount, true)} for review`;
}
