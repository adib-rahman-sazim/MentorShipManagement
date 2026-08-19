import { organization } from "@/shared/lib/auth-client";

import { resolvePostAuthDestination } from "./postAuthDestination.helpers";
import type { IResolvePostAuthDestinationFromSessionOptions } from "./postAuthDestination.interfaces";

export const resolvePostAuthDestinationFromSession = async ({
  storedRedirect,
  activeOrganizationId,
}: IResolvePostAuthDestinationFromSessionOptions): Promise<string> => {
  if (storedRedirect) {
    return storedRedirect;
  }

  const orgsResult = await organization.list();
  const organizations = orgsResult.data ?? [];
  const firstOrg = organizations[0];

  if (firstOrg && !activeOrganizationId) {
    await organization.setActive({ organizationId: firstOrg.id });
  }

  return resolvePostAuthDestination({
    storedRedirect: null,
    pendingInvitationId: null,
    hasActiveOrganization: Boolean(activeOrganizationId),
    hasListableOrganization: organizations.length > 0,
  });
};
