import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateUserMutation } from "@/shared/redux/rtk-apis/users/users.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  TOAST_MESSAGE_USER_ROLE_UPDATE_FAILED,
  TOAST_MESSAGE_USER_ROLE_UPDATED,
} from "./ChangeUserRoleForm.constants";
import {
  changeUserRoleValidationSchemaResolver,
  getChangeUserRoleDefaultValues,
} from "./ChangeUserRoleForm.helpers";
import { IUseChangeUserRoleFormParams } from "./ChangeUserRoleForm.interfaces";
import type { TChangeUserRoleFormFields } from "./ChangeUserRoleForm.types";

export const useChangeUserRoleForm = ({
  userId,
  currentRole,
  isOpen,
  onSuccess,
  onError,
}: IUseChangeUserRoleFormParams) => {
  const form = useForm<TChangeUserRoleFormFields>({
    defaultValues: getChangeUserRoleDefaultValues(currentRole),
    mode: "onSubmit",
    resolver: changeUserRoleValidationSchemaResolver,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(getChangeUserRoleDefaultValues(currentRole));
    }
  }, [form, isOpen, currentRole]);

  const [updateUser] = useUpdateUserMutation();

  const onSubmit = async (data: TChangeUserRoleFormFields) => {
    if (!userId) {
      return;
    }

    try {
      await updateUser({ id: userId, role: data.role }).unwrap();
      toast.success(TOAST_MESSAGE_USER_ROLE_UPDATED);
      onSuccess?.();
    } catch (error) {
      onError?.();
      toast.error(TOAST_MESSAGE_USER_ROLE_UPDATE_FAILED, {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return {
    form,
    onSubmit,
  };
};
