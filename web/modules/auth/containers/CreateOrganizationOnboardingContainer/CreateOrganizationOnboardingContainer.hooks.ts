import { useEffect, useMemo, useRef } from "react";

import { useRouter } from "next/router";

import { DASHBOARD_ROUTE, INVITE_ACCEPT_ROUTE } from "@/shared/constants/routes.constants";
import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useGetMyPendingInvitationsQuery } from "@/shared/redux/rtk-apis/invitations/invitations.api";
import { EPermission, EResource } from "@/shared/typedefs";

export const useCreateOrganizationOnboardingContainer = () => {
  const router = useRouter();
  const { activeOrganizationId, isLoading: isAuthLoading } = useAuth();
  const { isAllowed: canCreateOrganization, isLoading: isAbilityLoading } = useCan(
    EPermission.CREATE,
    EResource.ORGANIZATION,
  );

  const shouldCheckInvites = !isAuthLoading && !activeOrganizationId;

  const {
    data: pendingInvitations,
    isLoading: isInvitesLoading,
    isFetching: isInvitesFetching,
  } = useGetMyPendingInvitationsQuery(undefined, {
    skip: !shouldCheckInvites,
  });

  const redirectRoute = useMemo(() => {
    if (isAuthLoading || isAbilityLoading) {
      return null;
    }

    if (activeOrganizationId) {
      return DASHBOARD_ROUTE;
    }

    const firstInvite = pendingInvitations?.[0];
    if (firstInvite) {
      return `${INVITE_ACCEPT_ROUTE}?token=${firstInvite.id}`;
    }

    if (!canCreateOrganization) {
      return DASHBOARD_ROUTE;
    }

    return null;
  }, [
    activeOrganizationId,
    canCreateOrganization,
    isAbilityLoading,
    isAuthLoading,
    pendingInvitations,
  ]);

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || !redirectRoute || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    router.replace(redirectRoute);
  }, [redirectRoute, router]);

  const isCheckingInvites = shouldCheckInvites ? isInvitesLoading || isInvitesFetching : false;
  const isLoading = isAuthLoading || isAbilityLoading || isCheckingInvites || !!redirectRoute;

  return { isLoading };
};
