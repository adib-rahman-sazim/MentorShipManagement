import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { TResetPasswordFormFields } from "./ResetPasswordForm.types";

export const resetPasswordFormInitialValues: TResetPasswordFormFields = {
  password: "",
  confirmPassword: "",
};

export const resetPasswordFormValidationSchema: z.ZodType<TResetPasswordFormFields> = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordFormValidationResolver = zodResolver(resetPasswordFormValidationSchema);
