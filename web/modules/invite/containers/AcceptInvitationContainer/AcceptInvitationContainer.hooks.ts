import { useCallback, useState } from "react";

import { useRouter } from "next/router";

import { parseAsString, useQueryState } from "nuqs";
import { toast } from "sonner";

import { DASHBOARD_ROUTE, SIGN_IN_ROUTE, SIGN_UP_ROUTE } from "@/shared/constants/routes.constants";
import { organization } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useAppDispatch } from "@/shared/redux/hooks";
import projectApi from "@/shared/redux/rtk-apis/api.config";
import { useGetOrganizationInvitationQuery } from "@/shared/redux/rtk-apis/invitations/invitations.api";
import { persistPostAuthRedirect } from "@/shared/utils/postAuthRedirect";

import { IAcceptInvitationHookResult } from "./AcceptInvitationContainer.interfaces";

export const useAcceptInvitation = (): IAcceptInvitationHookResult => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: isAuthLoading, refetch } = useAuth();
  const [token] = useQueryState("token", parseAsString.withDefault(""));

  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: invitation,
    isLoading,
    isError,
  } = useGetOrganizationInvitationQuery(
    { id: token },
    {
      skip: !token || !router.isReady,
    },
  );

  const returnPath = router.asPath;

  const handleEmailSignUp = useCallback(() => {
    if (!invitation || !token) {
      return;
    }

    persistPostAuthRedirect(returnPath);

    const query: Record<string, string> = {
      email: invitation.email,
      redirect: returnPath,
    };

    if (invitation.firstName) {
      query["firstName"] = invitation.firstName;
    }

    if (invitation.lastName) {
      query["lastName"] = invitation.lastName;
    }

    router.push({
      pathname: SIGN_UP_ROUTE,
      query,
    });
  }, [invitation, returnPath, router, token]);

  const handleSignIn = useCallback(() => {
    persistPostAuthRedirect(returnPath);

    router.push({
      pathname: SIGN_IN_ROUTE,
      query: {
        redirect: returnPath,
      },
    });
  }, [returnPath, router]);

  const handleAcceptInvitation = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const result = await organization.acceptInvitation({
        invitationId: token,
      });

      if (result.error) {
        setError(result.error.message || "Failed to accept invitation");
      } else {
        if (result.data?.member?.organizationId) {
          await organization.setActive({ organizationId: result.data.member.organizationId });
        }
        await refetch();
        dispatch(projectApi.util.invalidateTags(["Permissions"]));
        setIsAccepted(true);
        setTimeout(() => {
          router.push(DASHBOARD_ROUTE);
        }, 2000);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setError("An unexpected error occurred");
    } finally {
      setIsAccepting(false);
    }
  }, [dispatch, refetch, router, token]);

  return {
    token,
    invitation,
    isLoading: !router.isReady || isLoading || isAuthLoading,
    isError,
    isAuthenticated,
    isAccepting,
    isAccepted,
    error,
    handleAcceptInvitation,
    handleEmailSignUp,
    handleSignIn,
  };
};
