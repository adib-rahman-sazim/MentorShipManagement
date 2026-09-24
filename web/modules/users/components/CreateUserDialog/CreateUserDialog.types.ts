import { z } from "zod";

import type { createUserFormValidationSchema } from "./CreateUserDialog.helpers";

export type TCreateUserFormFields = z.infer<typeof createUserFormValidationSchema>;