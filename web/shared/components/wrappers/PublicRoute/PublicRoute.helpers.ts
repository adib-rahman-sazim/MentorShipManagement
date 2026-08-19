import { HOME_ROUTE, SYSTEM_INVITE_ACCEPT_ROUTE } from "@/shared/constants/routes.constants";

export const isHomeRoute = (pathname: string) => pathname === HOME_ROUTE;

export const isSystemInviteAcceptRoute = (pathname: string) =>
  pathname === SYSTEM_INVITE_ACCEPT_ROUTE;
