import {
  AI_CHAT_ROUTE,
  BILLING_ROUTE,
  DASHBOARD_ROUTE,
  DOCUMENT_VECTOR_STORE_ROUTE,
  ORGANIZATIONS_ROUTE,
  SETTINGS_ROUTE,
  USERS_ROUTE,
} from "@/shared/constants/routes.constants";
import { EResource } from "@/shared/typedefs";

export const UNAUTHORIZED_STATUS_CODE = "403";
export const UNAUTHORIZED_HEADING = "Unauthorized";
export const UNAUTHORIZED_DESCRIPTION =
  "Sorry, you do not have access to this page. That's all we know.";
export const UNAUTHORIZED_GO_BACK_LABEL = "Go Back";
export const UNAUTHORIZED_SIGN_OUT_LABEL = "Sign Out";
export const UNAUTHORIZED_COMPLETE_INVITATION_LABEL = "Complete invitation";
export const UNAUTHORIZED_CREATE_ORGANIZATION_LABEL = "Create organization";

export const DEFAULT_AUTHORIZED_ROUTE_CANDIDATES = [
  { route: DASHBOARD_ROUTE, resource: EResource.DASHBOARD },
  { route: AI_CHAT_ROUTE, resource: EResource.AI_CHAT },
  { route: DOCUMENT_VECTOR_STORE_ROUTE, resource: EResource.DOCUMENT_VECTOR_STORE },
  { route: BILLING_ROUTE, resource: EResource.BILLING },
  { route: SETTINGS_ROUTE, resource: EResource.SETTINGS },
  { route: USERS_ROUTE, resource: EResource.USER },
  { route: ORGANIZATIONS_ROUTE, resource: EResource.ORGANIZATION },
] as const;
