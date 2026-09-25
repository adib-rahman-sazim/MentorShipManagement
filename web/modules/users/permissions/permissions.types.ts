import { z } from "zod";

import type { userPermissionsValidationSchema } from "./permissions.helpers";

export type TUserPermissionsFormFields = z.infer<typeof userPermissionsValidationSchema>;

export type TPermissionAccess = TUserPermissionsFormFields["access"];
