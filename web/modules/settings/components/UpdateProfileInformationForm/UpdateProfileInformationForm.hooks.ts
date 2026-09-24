import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateUserProfileMutation } from "@/shared/redux/rtk-apis/user-profiles/user-profiles.api";
import { IUserResponse } from "@/shared/typedefs";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  TOAST_MESSAGE_PROFILE_UPDATE_FAILED,
  TOAST_MESSAGE_PROFILE_UPDATED,
} from "./UpdateProfileInformationForm.constants";
import {
  getUpdateProfileInformationInitialValues,
  updateProfileInformationValidationSchemaResolver,
} from "./UpdateProfileInformationForm.helpers";
import { TUpdateProfileInformationFormFields } from "./UpdateProfileInformationForm.types";

export const useUpdateUserProfileInformationForm = (userProfile?: IUserResponse) => {
  const form = useForm<TUpdateProfileInformationFormFields>({
    defaultValues: getUpdateProfileInformationInitialValues(userProfile),
    mode: "onBlur",
    resolver: updateProfileInformationValidationSchemaResolver,
  });

  useEffect(() => {
    form.reset(getUpdateProfileInformationInitialValues(userProfile));
  }, [userProfile, form]);

  const [updateUserProfileMutation] = useUpdateUserProfileMutation();

  const onSubmit = async (updatedValues: TUpdateProfileInformationFormFields) => {
    try {
      await updateUserProfileMutation(updatedValues).unwrap();
      form.reset(updatedValues);
      toast.success(TOAST_MESSAGE_PROFILE_UPDATED);
    } catch (error) {
      toast.error(TOAST_MESSAGE_PROFILE_UPDATE_FAILED, {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return { form, onSubmit };
};
