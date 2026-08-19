import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  COMPONENT_EXAMPLES_BIO_MAX_LENGTH,
  COMPONENT_EXAMPLES_BIO_MIN_LENGTH,
  COMPONENT_EXAMPLES_E164_PHONE_REGEX,
  COMPONENT_EXAMPLES_EMAIL_MAX_LENGTH,
  COMPONENT_EXAMPLES_EMAIL_MIN_LENGTH,
  COMPONENT_EXAMPLES_FULL_NAME_MAX_LENGTH,
  COMPONENT_EXAMPLES_FULL_NAME_MIN_LENGTH,
  COMPONENT_EXAMPLES_OTP_LENGTH,
  COMPONENT_EXAMPLES_PASSWORD_MAX_LENGTH,
  COMPONENT_EXAMPLES_PASSWORD_MIN_LENGTH,
  COMPONENT_EXAMPLES_PHONE_MAX_LENGTH,
  COMPONENT_EXAMPLES_PHONE_MIN_LENGTH,
} from "./ComponentExamplesForm.constants";
import {
  EComponentExamplePlan,
  EComponentExampleRole,
  EComponentExampleTag,
} from "./ComponentExamplesForm.enums";
import type { TComponentExamplesFormFields } from "./ComponentExamplesForm.types";

export const componentExamplesFormValidationSchema: z.ZodType<TComponentExamplesFormFields> =
  z.object({
    fullName: z
      .string()
      .trim()
      .min(COMPONENT_EXAMPLES_FULL_NAME_MIN_LENGTH, "Full name is required")
      .max(
        COMPONENT_EXAMPLES_FULL_NAME_MAX_LENGTH,
        `Full name must be ${COMPONENT_EXAMPLES_FULL_NAME_MAX_LENGTH} characters or fewer`,
      ),
    email: z
      .string()
      .trim()
      .min(COMPONENT_EXAMPLES_EMAIL_MIN_LENGTH, "Email is required")
      .max(
        COMPONENT_EXAMPLES_EMAIL_MAX_LENGTH,
        `Email must be ${COMPONENT_EXAMPLES_EMAIL_MAX_LENGTH} characters or fewer`,
      )
      .email("Enter a valid email"),
    password: z
      .string()
      .min(
        COMPONENT_EXAMPLES_PASSWORD_MIN_LENGTH,
        `Password must be at least ${COMPONENT_EXAMPLES_PASSWORD_MIN_LENGTH} characters`,
      )
      .max(
        COMPONENT_EXAMPLES_PASSWORD_MAX_LENGTH,
        `Password must be ${COMPONENT_EXAMPLES_PASSWORD_MAX_LENGTH} characters or fewer`,
      ),
    bio: z
      .string()
      .trim()
      .min(COMPONENT_EXAMPLES_BIO_MIN_LENGTH, "Bio is required")
      .max(
        COMPONENT_EXAMPLES_BIO_MAX_LENGTH,
        `Bio must be ${COMPONENT_EXAMPLES_BIO_MAX_LENGTH} characters or fewer`,
      ),
    age: z
      .number({ invalid_type_error: "Age is required" })
      .int("Age must be a whole number")
      .min(1, "Age must be at least 1")
      .max(120, "Age must be 120 or fewer")
      .nullable()
      .refine((value) => value !== null, { message: "Age is required" }),
    phone: z
      .string()
      .trim()
      .min(COMPONENT_EXAMPLES_PHONE_MIN_LENGTH, "Phone number is required")
      .max(
        COMPONENT_EXAMPLES_PHONE_MAX_LENGTH,
        `Phone number must be ${COMPONENT_EXAMPLES_PHONE_MAX_LENGTH} characters or fewer`,
      )
      .regex(COMPONENT_EXAMPLES_E164_PHONE_REGEX, "Enter a valid E.164 phone number"),
    role: z.nativeEnum(EComponentExampleRole, { required_error: "Role is required" }),
    tags: z.array(z.nativeEnum(EComponentExampleTag)).min(1, "Select at least one tag"),
    acceptedTerms: z.boolean().refine((value) => value, {
      message: "You must accept the terms",
    }),
    notificationsEnabled: z.boolean(),
    plan: z.nativeEnum(EComponentExamplePlan, { required_error: "Plan is required" }),
    startDate: z
      .date({ invalid_type_error: "Start date is required" })
      .nullable()
      .refine((value) => value !== null, { message: "Start date is required" }),
    satisfaction: z
      .number()
      .min(0, "Satisfaction must be at least 0")
      .max(100, "Satisfaction must be 100 or fewer"),
    otp: z
      .string()
      .trim()
      .length(COMPONENT_EXAMPLES_OTP_LENGTH, `OTP must be ${COMPONENT_EXAMPLES_OTP_LENGTH} digits`)
      .regex(/^\d+$/, "OTP must contain only digits"),
  });

export const componentExamplesFormResolver = zodResolver(componentExamplesFormValidationSchema);
