import type { NextRouter } from "next/router";

import { SIGN_IN_ROUTE } from "../../constants/routes.constants";
import { signOut as betterAuthSignOut } from "../../lib/auth-client";
import projectApi from "../../redux/rtk-apis/api.config";
import { TAppDispatch } from "../../redux/store.types";
import { SIGN_OUT_EVENT_NAME } from "./signOut.constants";
import { ESignOutReason } from "./signOut.enums";

const emitSignOutEvent = (signOutReason: ESignOutReason) => {
  localStorage.setItem(SIGN_OUT_EVENT_NAME, signOutReason);
  localStorage.removeItem(SIGN_OUT_EVENT_NAME);
};

export const signOut = async ({
  dispatch,
  router,
  reason,
  redirectRoute = SIGN_IN_ROUTE,
  shouldEmitSignOutEvent = true,
  shouldRedirect = true,
}: {
  dispatch: TAppDispatch;
  router: NextRouter;
  reason: ESignOutReason;
  redirectRoute?: string;
  shouldEmitSignOutEvent?: boolean;
  shouldRedirect?: boolean;
}) => {
  await betterAuthSignOut();

  localStorage.clear();

  dispatch(projectApi.util.resetApiState());

  if (shouldEmitSignOutEvent) {
    emitSignOutEvent(reason);
  }

  if (!shouldRedirect) {
    return;
  }

  router.push(redirectRoute);
};
