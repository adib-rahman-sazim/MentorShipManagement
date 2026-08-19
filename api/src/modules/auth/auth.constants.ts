import { EUserRole } from "@/common/enums/roles.enums";

export const BETTER_AUTH_BASE_PATH = "/api/v1/auth";

export const AUTH_INVITATION_TOKEN_HEADER = "x-invitation-token";

export const SELF_SIGNUP_ALLOWED_ROLES: EUserRole[] = [EUserRole.CUSTOMER];

export const AUTH_MEMBER_ERROR_MESSAGES = {
  ONLY_CUSTOMERS_IN_ORGANIZATION: "Only customers can belong to an organization",
};

export const AUTH_INVITATION_ERROR_MESSAGES = {
  INVALID_SYSTEM_ROLE_INVITATION: "A valid invitation proof is required for this sign-up",
  INVITED_EMAIL_MISMATCH: "This invitation is only valid for the invited email",
  ORGANIZATION_REQUIRED_FOR_ORG_BOUND_ROLES:
    "Organization is required for organization-bound roles",
  ORGANIZATION_NOT_ALLOWED_FOR_SYSTEM_ROLES: "Organization is not allowed for system-level roles",
  ROLE_NOT_FOUND: (role: string) => `Role '${role}' was not found`,
};
