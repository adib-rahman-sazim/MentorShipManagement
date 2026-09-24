import { EUserRole } from "@/shared/typedefs";

import { ASSIGNABLE_USER_ROLES } from "./users.constants";

export function isAssignableUserRole(role: EUserRole): boolean {
  return ASSIGNABLE_USER_ROLES.includes(role);
}