import {
  CREATE_ORGANIZATION_ROUTE,
  DASHBOARD_ROUTE,
  INVITE_ACCEPT_ROUTE,
} from "@/shared/constants/routes.constants";

import type { IResolvePostAuthDestinationInput } from "./postAuthDestination.interfaces";

export const resolvePostAuthDestination = ({
  storedRedirect,
  pendingInvitationId,
  hasActiveOrganization,
  hasListableOrganization,
}: IResolvePostAuthDestinationInput): string => {
  if (storedRedirect) {
    return storedRedirect;
  }

  if (hasActiveOrganization || hasListableOrganization) {
    return DASHBOARD_ROUTE;
  }

  if (pendingInvitationId) {
    return `${INVITE_ACCEPT_ROUTE}?token=${pendingInvitationId}`;
  }

  return CREATE_ORGANIZATION_ROUTE;
};
