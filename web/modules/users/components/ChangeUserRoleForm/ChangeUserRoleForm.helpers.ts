import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ROLE_NOT_ASSIGNABLE_MESSAGE } from "@/modules/users/users.constants";
import { isAssignableUserRole } from "@/modules/users/users.helpers";
import { EUserRole } from "@/shared/typedefs";

import { CHANGE_USER_ROLE_REQUIRED_MESSAGE } from "./ChangeUserRoleForm.constants";
import type { TChangeUserRoleFormFields } from "./ChangeUserRoleForm.types";

export const changeUserRoleValidationSchema = z.object({
  role: z
    .nativeEnum(EUserRole, { required_error: CHANGE_USER_ROLE_REQUIRED_MESSAGE })
    .refine(isAssignableUserRole, ROLE_NOT_ASSIGNABLE_MESSAGE),
});

export const changeUserRoleValidationSchemaResolver = zodResolver(changeUserRoleValidationSchema);

export function getChangeUserRoleDefaultValues(
  currentRole?: EUserRole,
): Partial<TChangeUserRoleFormFields> {
  return {
    role: currentRole && isAssignableUserRole(currentRole) ? currentRole : undefined,
  };
}
