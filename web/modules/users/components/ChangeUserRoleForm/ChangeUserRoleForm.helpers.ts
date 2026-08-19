import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

import type { TChangeUserRoleFormFields } from "./ChangeUserRoleForm.types";

export const changeUserRoleValidationSchema = z.object({
  role: z.nativeEnum(EUserRole, {
    required_error: "Role is required",
  }),
});

export const changeUserRoleDefaultValues: Partial<TChangeUserRoleFormFields> = {
  role: undefined,
};

export const changeUserRoleValidationSchemaResolver = zodResolver(changeUserRoleValidationSchema);
