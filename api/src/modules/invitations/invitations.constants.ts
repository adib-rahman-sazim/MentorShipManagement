import { EUserRole } from "@/common/enums/roles.enums";

export const INVITATION_PERMISSION_MATRIX: Record<EUserRole, EUserRole[]> = {
  [EUserRole.SUPER_ADMIN]: [EUserRole.SUPER_ADMIN, EUserRole.MANAGER, EUserRole.CUSTOMER],
  [EUserRole.MANAGER]: [EUserRole.MANAGER, EUserRole.CUSTOMER],
  [EUserRole.CUSTOMER]: [EUserRole.CUSTOMER],
};

export const INVITATION_EXPIRY_DAYS = 7;

export const INVITATION_DEFAULT_ORGANIZATION_NAME = "the organization";

export const INVITATION_ERROR_MESSAGES = {
  ROLE_NOT_ALLOWED: (inviterRole: EUserRole, targetRole: EUserRole) =>
    `Users with role '${inviterRole}' cannot invite users with role '${targetRole}'`,
  ORGANIZATION_REQUIRED: "Organization is required for customer invitations",
  ORGANIZATION_NOT_ALLOWED: "System-level role invitations should not include an organization",
  ORGANIZATION_NOT_FOUND: "Organization not found",
  INVITATION_NOT_FOUND: "Invitation not found",
  INVITATION_ALREADY_EXISTS: "An active invitation already exists for this email",
  INVITATION_EXPIRED: "Invitation has expired",
  INVITATION_CANCELED: "Invitation has been canceled",
  INVITATION_ALREADY_ACCEPTED: "Invitation has already been accepted",
  INVITATION_NO_LONGER_VALID: "Invitation is no longer valid",
  CUSTOMER_MUST_BE_ORG_CREATOR: "Only the organization creator can invite customers",
  NO_ACTIVE_ORGANIZATION: "No active organization",
};

export const SYSTEM_INVITATION_ACCEPT_PATH = "/invite/system/accept";
