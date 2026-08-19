import { useCallback } from "react";

import { useRouter } from "next/router";

import { SIGN_IN_ROUTE } from "../../constants/routes.constants";
import { useAppDispatch } from "../../redux/hooks";
import { ESignOutReason, signOut as signOutImpl } from "../../utils/signOut";
import { ISignOutArgs } from "./useSignOut.interfaces";

export const useSignOut = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const signOut = useCallback(
    async (args?: ISignOutArgs) => {
      const {
        reason = ESignOutReason.UserSignedOut,
        redirectRoute = SIGN_IN_ROUTE,
        shouldEmitSignOutEvent = true,
        shouldRedirect = true,
      } = args ?? {};

      await signOutImpl({
        dispatch,
        router,
        reason,
        redirectRoute,
        shouldEmitSignOutEvent,
        shouldRedirect,
      });
    },
    [router, dispatch],
  );

  return { signOut };
};
