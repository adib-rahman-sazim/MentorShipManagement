import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";

export const isSafePostAuthRedirect = (redirect: string): boolean => {
  if (!redirect.startsWith("/")) {
    return false;
  }

  if (redirect.startsWith("//")) {
    return false;
  }

  return true;
};

export const getPostAuthDestination = (storedRedirect: string | null): string =>
  storedRedirect && isSafePostAuthRedirect(storedRedirect) ? storedRedirect : DASHBOARD_ROUTE;
