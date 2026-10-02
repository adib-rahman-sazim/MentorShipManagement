import pluralize from "pluralize";

import type { TPersonNodeData } from "@/modules/graph/graph.types";
import { USER_ROLE_LABELS, USER_STATE_LABELS } from "@/modules/users/users.constants";
import { EUserState } from "@/shared/typedefs";

import { META_SEPARATOR, NO_MENTOR_LABEL, SUBORDINATE_NOUN } from "./PersonNode.constants";

export function getPersonMeta({
  role,
  state,
  subordinateCount,
  hasSupervisor,
}: TPersonNodeData): string {
  const parts = [USER_ROLE_LABELS[role]];
  const subordinateNoun = SUBORDINATE_NOUN[role];

  if (subordinateNoun) {
    parts.push(pluralize(subordinateNoun, subordinateCount, true));
  } else if (!hasSupervisor) {
    parts.push(NO_MENTOR_LABEL);
  }

  if (state === EUserState.INACTIVE) {
    parts.push(USER_STATE_LABELS[state]);
  }

  return parts.join(META_SEPARATOR);
}
