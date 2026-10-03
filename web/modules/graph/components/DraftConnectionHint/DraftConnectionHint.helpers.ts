import pluralize from "pluralize";

import { checkStagedConnection } from "@/modules/graph/draft.helpers";
import type { TConnectionContext } from "@/modules/graph/draft.types";

import {
  HINT_FROM_SUBORDINATE_VERB,
  HINT_FROM_SUPERVISOR_VERB,
  HINT_PERSON_NOUN,
  HINT_SEPARATOR,
} from "./DraftConnectionHint.constants";

export function getConnectionHint(
  fromId: string,
  isFromSupervisor: boolean,
  context: TConnectionContext,
): string {
  const fromName = context.index.peopleById.get(fromId)?.name ?? fromId;
  const validCount = [...context.index.peopleById.keys()].filter(
    (personId) =>
      checkStagedConnection(
        isFromSupervisor
          ? { source: fromId, target: personId }
          : { source: personId, target: fromId },
        context,
      ).ok,
  ).length;
  const verb = isFromSupervisor ? HINT_FROM_SUPERVISOR_VERB : HINT_FROM_SUBORDINATE_VERB;

  return [
    `Connecting from ${fromName}`,
    `${pluralize(HINT_PERSON_NOUN, validCount, true)} ${verb}`,
  ].join(HINT_SEPARATOR);
}
