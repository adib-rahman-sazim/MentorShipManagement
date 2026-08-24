import { DASHBOARD_ROUTE, SETTINGS_ROUTE, USERS_ROUTE } from "@/shared/constants/routes.constants";
import { EResource } from "@/shared/typedefs";

export const UNAUTHORIZED_STATUS_CODE = "403";
export const UNAUTHORIZED_HEADING = "Unauthorized";
export const UNAUTHORIZED_DESCRIPTION =
  "Sorry, you do not have access to this page. That's all we know.";
export const UNAUTHORIZED_GO_BACK_LABEL = "Go Back";
export const UNAUTHORIZED_SIGN_OUT_LABEL = "Sign Out";

export const DEFAULT_AUTHORIZED_ROUTE_CANDIDATES = [
  { route: DASHBOARD_ROUTE, resource: EResource.DASHBOARD },
  { route: USERS_ROUTE, resource: EResource.USER },
  { route: SETTINGS_ROUTE, resource: EResource.SETTINGS },
] as const;