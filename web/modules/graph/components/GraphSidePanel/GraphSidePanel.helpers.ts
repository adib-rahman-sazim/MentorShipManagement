import { SUBORDINATE_ROLE, SUPERVISOR_ROLE } from "@/modules/graph/graph.constants";
import type { TLinkDetails, TPersonDetails } from "@/modules/graph/graph.types";
import { IMentorshipGraphResponse } from "@/shared/typedefs";

import { ALERT_DIALOG_SELECTOR } from "./GraphSidePanel.constants";

export function getPersonDetails(
  { nodes, edges }: IMentorshipGraphResponse,
  personId: string,
): TPersonDetails | null {
  const person = nodes.find(({ id }) => id === personId);

  if (!person) {
    return null;
  }

  const supervisorId = edges.find(({ subordinateId }) => subordinateId === personId)?.supervisorId;
  const subordinateIds = new Set(
    edges
      .filter(({ supervisorId: id }) => id === personId)
      .map(({ subordinateId }) => subordinateId),
  );

  return {
    person,
    supervisor: nodes.find(({ id }) => id === supervisorId) ?? null,
    supervisorRole: SUPERVISOR_ROLE[person.role] ?? null,
    subordinateRole: SUBORDINATE_ROLE[person.role] ?? null,
    subordinates: nodes.filter(({ id }) => subordinateIds.has(id)),
  };
}

export function getLinkDetails(
  { nodes, edges }: IMentorshipGraphResponse,
  linkId: string,
): TLinkDetails | null {
  const link = edges.find(({ id }) => id === linkId);
  const supervisor = nodes.find(({ id }) => id === link?.supervisorId);
  const subordinate = nodes.find(({ id }) => id === link?.subordinateId);

  return link && supervisor && subordinate ? { link, supervisor, subordinate } : null;
}

export function isInsideAlertDialog(target: EventTarget | null) {
  return target instanceof Element && target.closest(ALERT_DIALOG_SELECTOR) !== null;
}
