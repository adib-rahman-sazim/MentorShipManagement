import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateUserProfileMutation } from "@/shared/redux/rtk-apis/user-profiles/user-profiles.api";
import {
  ICurrentUserProfileResponse,
  IUpdateProfileDto,
} from "@/shared/redux/rtk-apis/user-profiles/user-profiles.interfaces";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  getUpdateProfileInformationInitialValues,
  updateProfileInformationValidationSchemaResolver,
} from "./UpdateProfileInformationForm.helpers";

export const useUpdateUserProfileInformationForm = (userProfile?: ICurrentUserProfileResponse) => {
  const form = useForm<IUpdateProfileDto>({
    defaultValues: getUpdateProfileInformationInitialValues(userProfile),
    mode: "onBlur",
    resolver: updateProfileInformationValidationSchemaResolver,
  });

  useEffect(() => {
    form.reset(getUpdateProfileInformationInitialValues(userProfile));
  }, [userProfile, form]);

  const [updateUserProfileMutation, { reset }] = useUpdateUserProfileMutation();

  const onSubmit = async (updatedValues: IUpdateProfileDto) => {
    try {
      await updateUserProfileMutation(updatedValues);

      form.reset(updatedValues);
      reset();

      toast.success("Profile information updated successfully");
    } catch (error) {
      toast.error("Failed to update profile information", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return { form, onSubmit };
};
