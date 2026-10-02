import { z } from "zod";

import type { updateProfileInformationValidationSchema } from "./UpdateProfileInformationForm.helpers";

export type TUpdateProfileInformationFormFields = z.infer<
  typeof updateProfileInformationValidationSchema
>;
