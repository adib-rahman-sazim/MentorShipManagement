import pluralize from "pluralize";

import { CHANGE_NOUN } from "./PublishConfirm.constants";

export function getPublishLabel(changeCount: number): string {
  return `Publish ${pluralize(CHANGE_NOUN, changeCount, true)}`;
}

export function getPublishTitle(changeCount: number): string {
  return `${getPublishLabel(changeCount)}?`;
}
