import { CREATE_ORGANIZATION_ROUTE, SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";

export const getSignInUrlWithRedirectParam = (redirectTo: string) => {
  const url = new URL(SIGN_IN_ROUTE, window.location.origin);
  url.searchParams.set("redirect", redirectTo);
  return url.toString();
};

export const isCreateOrganizationRoute = (pathname: string) =>
  pathname === CREATE_ORGANIZATION_ROUTE;
