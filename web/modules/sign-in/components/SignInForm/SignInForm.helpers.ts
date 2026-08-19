import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { TSignInFormFields } from "./SignInForm.types";

export const signInFormInitialValues: TSignInFormFields = {
  email: "",
  password: "",
};

export const signInFormValidationSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export const signInFormValidationSchemaResolver = zodResolver(signInFormValidationSchema);
