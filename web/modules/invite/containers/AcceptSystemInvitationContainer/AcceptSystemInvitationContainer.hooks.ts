import { useCallback } from "react";

import { useRouter } from "next/router";

import { parseAsString, useQueryState } from "nuqs";

import { INVITATION_TOKEN_QUERY_PARAM } from "@/shared/constants/invitation.constants";
import { SIGN_UP_ROUTE } from "@/shared/constants/routes.constants";
import { useGetSystemInvitationQuery } from "@/shared/redux/rtk-apis/invitations/invitations.api";

import { IAcceptSystemInvitationHookResult } from "./AcceptSystemInvitationContainer.interfaces";

export const useAcceptSystemInvitation = (): IAcceptSystemInvitationHookResult => {
  const router = useRouter();
  const [token] = useQueryState("token", parseAsString.withDefault(""));

  const {
    data: invitation,
    isLoading,
    isError,
  } = useGetSystemInvitationQuery(
    { token },
    {
      skip: !token || !router.isReady,
    },
  );

  const handleEmailSignUp = useCallback(() => {
    if (!invitation || !token) {
      return;
    }

    const query: Record<string, string> = {
      [INVITATION_TOKEN_QUERY_PARAM]: token,
      email: invitation.email,
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
  }, [invitation, router, token]);

  return {
    token,
    invitation,
    isLoading: !router.isReady || isLoading,
    isError,
    handleEmailSignUp,
  };
};
