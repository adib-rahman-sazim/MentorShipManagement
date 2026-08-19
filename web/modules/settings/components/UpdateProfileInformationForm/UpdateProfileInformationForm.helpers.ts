import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  ICurrentUserProfileResponse,
  IUpdateProfileDto,
} from "@/shared/redux/rtk-apis/user-profiles/user-profiles.interfaces";

export const getUpdateProfileInformationInitialValues = (
  userProfile?: ICurrentUserProfileResponse,
): IUpdateProfileDto => ({
  firstName: userProfile?.firstName || "",
  lastName: userProfile?.lastName || "",
});

export const updateProfileInformationValidationSchema: z.ZodType<IUpdateProfileDto> = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
});

export const updateProfileInformationValidationSchemaResolver = zodResolver(
  updateProfileInformationValidationSchema,
);
