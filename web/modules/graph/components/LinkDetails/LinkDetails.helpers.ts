import dayjs from "dayjs";

import type { TLinkDetails } from "@/modules/graph/graph.types";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";

import { LINK_SINCE_DATE_FORMAT } from "./LinkDetails.constants";

export function getLinkKind({ supervisor, subordinate }: TLinkDetails): string {
  return `${USER_ROLE_LABELS[supervisor.role]} → ${USER_ROLE_LABELS[subordinate.role]} link`;
}

export function getLinkSentence({ supervisor, subordinate }: TLinkDetails): string {
  return `${supervisor.name} mentors ${subordinate.name}`;
}

export function getLinkSince({ link }: TLinkDetails): string {
  return `Live since ${dayjs(link.startedAt).format(LINK_SINCE_DATE_FORMAT)}`;
}
