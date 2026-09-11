import { SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";

export const getSignInUrlWithRedirectParam = (redirectTo: string) =>
  `${SIGN_IN_ROUTE}?redirect=${encodeURIComponent(redirectTo)}`;
