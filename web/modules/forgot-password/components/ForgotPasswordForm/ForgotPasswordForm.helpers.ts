import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const forgotPasswordFormInitialValues = {
  email: "",
};

const forgotPasswordFormValidationSchema: z.ZodType<typeof forgotPasswordFormInitialValues> =
  z.object({
    email: z.string().email(),
  });

export const forgotPasswordFormValidationSchemaResolver = zodResolver(
  forgotPasswordFormValidationSchema,
);
