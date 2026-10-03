import { USER_ROLE_LABELS, USER_STATE_LABELS } from "@/modules/users/users.constants";
import { IMentorshipGraphNodeResponse } from "@/shared/typedefs";

import { SUBTITLE_SEPARATOR } from "./PersonDetails.constants";

export function getPersonSubtitle({ role, state }: IMentorshipGraphNodeResponse): string {
  return [USER_ROLE_LABELS[role], USER_STATE_LABELS[state]].join(SUBTITLE_SEPARATOR);
}
