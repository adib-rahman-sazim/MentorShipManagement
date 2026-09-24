import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateUserMutation } from "@/shared/redux/rtk-apis/users/users.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import {
  TOAST_MESSAGE_USER_CREATE_FAILED,
  TOAST_MESSAGE_USER_CREATED,
} from "./CreateUserDialog.constants";
import {
  buildCreateUserPayload,
  createUserFormInitialValues,
  createUserFormResolver,
} from "./CreateUserDialog.helpers";
import { IUseCreateUserFormParams } from "./CreateUserDialog.interfaces";
import { TCreateUserFormFields } from "./CreateUserDialog.types";

export const useCreateUserForm = ({ onSuccess }: IUseCreateUserFormParams) => {
  const form = useForm<TCreateUserFormFields>({
    defaultValues: createUserFormInitialValues,
    resolver: createUserFormResolver,
  });

  const [createUser] = useCreateUserMutation();

  const onSubmit = async (values: TCreateUserFormFields) => {
    try {
      await createUser(buildCreateUserPayload(values)).unwrap();
      toast.success(TOAST_MESSAGE_USER_CREATED);
      form.reset(createUserFormInitialValues);
      onSuccess();
    } catch (error) {
      toast.error(TOAST_MESSAGE_USER_CREATE_FAILED, {
        description: parseApiErrorMessage(error),
      });
    }
  };

  const resetForm = () => form.reset(createUserFormInitialValues);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
  };
};