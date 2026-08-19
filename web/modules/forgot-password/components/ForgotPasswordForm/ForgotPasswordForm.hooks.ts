import { useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { requestPasswordReset } from "@/shared/lib/auth-client";

import {
  forgotPasswordFormInitialValues,
  forgotPasswordFormValidationSchemaResolver,
} from "./ForgotPasswordForm.helpers";

export const useForgotPasswordForm = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<typeof forgotPasswordFormInitialValues>({
    defaultValues: forgotPasswordFormInitialValues,
    resolver: forgotPasswordFormValidationSchemaResolver,
    mode: "onBlur",
  });

  const onSubmit = async (values: typeof forgotPasswordFormInitialValues) => {
    const result = await requestPasswordReset({
      email: values.email,
      redirectTo: "/reset-password",
    });

    if (result.error) {
      toast.error("An error occurred", {
        description: result.error.message || "Could not send reset link",
      });
      return;
    }

    setIsSuccess(true);
  };

  return {
    form,
    onSubmit,
    isSuccess,
  };
};
