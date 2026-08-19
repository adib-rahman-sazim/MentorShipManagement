import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

export const INVITE_USER_ROLE_OPTIONS: Array<{ value: EUserRole; label: string }> = [
  { value: EUserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: EUserRole.MANAGER, label: "Manager" },
  { value: EUserRole.CUSTOMER, label: "Customer" },
];

export const CREATE_USER_ROLE_OPTIONS = INVITE_USER_ROLE_OPTIONS;

export const INVITE_ORGANIZATIONS_PAGE_SIZE = 100;

export const INVITE_ORGANIZATION_SELECT_LABEL = "Organization";

export const INVITE_ORGANIZATION_SELECT_PLACEHOLDER = "Select an organization";

export const INVITE_ORGANIZATION_LOADING_PLACEHOLDER = "Loading organizations...";

export const INVITE_ORGANIZATION_EMPTY_PLACEHOLDER = "No organizations available";

export const INVITE_ORGANIZATION_REQUIRED_MESSAGE = "Organization is required";

export const INVITE_ORGANIZATION_NOT_ALLOWED_MESSAGE = "Organization is not allowed for this role";
