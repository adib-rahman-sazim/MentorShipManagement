import { z } from "zod";

import type { changeUserRoleValidationSchema } from "./ChangeUserRoleForm.helpers";

export type TChangeUserRoleFormFields = z.infer<typeof changeUserRoleValidationSchema>;
