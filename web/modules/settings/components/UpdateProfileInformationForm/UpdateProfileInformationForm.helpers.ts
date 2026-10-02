import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { IUserResponse } from "@/shared/typedefs";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_NAME_REQUIRED_MESSAGE,
  PROFILE_NAME_TOO_LONG_MESSAGE,
} from "./UpdateProfileInformationForm.constants";
import type { TUpdateProfileInformationFormFields } from "./UpdateProfileInformationForm.types";

export const updateProfileInformationValidationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(PROFILE_NAME_MIN_LENGTH, PROFILE_NAME_REQUIRED_MESSAGE)
    .max(PROFILE_NAME_MAX_LENGTH, PROFILE_NAME_TOO_LONG_MESSAGE),
});

export const updateProfileInformationValidationSchemaResolver = zodResolver(
  updateProfileInformationValidationSchema,
);

export function getUpdateProfileInformationInitialValues(
  userProfile?: IUserResponse,
): TUpdateProfileInformationFormFields {
  return {
    name: userProfile?.name ?? "",
  };
}
