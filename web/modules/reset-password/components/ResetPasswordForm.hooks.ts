import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";
import { resetPassword } from "@/shared/lib/auth-client";

import {
  resetPasswordFormInitialValues,
  resetPasswordFormValidationResolver,
} from "./ResetPasswordForm.helpers";
import { TResetPasswordFormFields } from "./ResetPasswordForm.types";

export const useResetPasswordForm = (token: string) => {
  const router = useRouter();
  const form = useForm<TResetPasswordFormFields>({
    defaultValues: resetPasswordFormInitialValues,
    resolver: resetPasswordFormValidationResolver,
    mode: "onBlur",
  });

  const onSubmit = async (values: TResetPasswordFormFields) => {
    if (!token) {
      return;
    }

    const result = await resetPassword({
      token,
      newPassword: values.password,
    });

    if (result.error) {
      toast.error("Failed to reset password", {
        description: result.error.message || "Could not reset password",
      });
      return;
    }

    toast.success("Password reset successfully");
    form.reset();

    setTimeout(() => {
      router.replace(SIGN_IN_ROUTE);
    }, 2000);
  };

  return {
    form,
    onSubmit,
  };
};
