import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } from "@/shared/constants/http.constants";
import { TOAST_MESSAGE_ACCOUNT_DEACTIVATED } from "@/shared/constants/toastMessages.constants";

import {
  SIGN_IN_EMAIL_INVALID_MESSAGE,
  SIGN_IN_EMAIL_MAX_LENGTH,
  SIGN_IN_EMAIL_TOO_LONG_MESSAGE,
  SIGN_IN_PASSWORD_MAX_LENGTH,
  SIGN_IN_PASSWORD_MIN_LENGTH,
  SIGN_IN_PASSWORD_TOO_LONG_MESSAGE,
  SIGN_IN_PASSWORD_TOO_SHORT_MESSAGE,
  TOAST_MESSAGE_INVALID_CREDENTIALS,
  TOAST_MESSAGE_UNEXPECTED_ERROR,
} from "./SignInForm.constants";
import { TSignInError, TSignInFormFields } from "./SignInForm.types";

export const signInFormInitialValues: TSignInFormFields = {
  email: "",
  password: "",
};

export const signInFormValidationSchema = z.object({
  email: z
    .string()
    .trim()
    .max(SIGN_IN_EMAIL_MAX_LENGTH, SIGN_IN_EMAIL_TOO_LONG_MESSAGE)
    .email(SIGN_IN_EMAIL_INVALID_MESSAGE),
  password: z
    .string()
    .min(SIGN_IN_PASSWORD_MIN_LENGTH, SIGN_IN_PASSWORD_TOO_SHORT_MESSAGE)
    .max(SIGN_IN_PASSWORD_MAX_LENGTH, SIGN_IN_PASSWORD_TOO_LONG_MESSAGE),
});

export const signInFormValidationSchemaResolver = zodResolver(signInFormValidationSchema);

export const getSignInErrorMessage = (error?: TSignInError): string => {
  if (error?.status === HTTP_STATUS_UNAUTHORIZED) {
    return TOAST_MESSAGE_INVALID_CREDENTIALS;
  }

  if (error?.status === HTTP_STATUS_FORBIDDEN) {
    return error.message || TOAST_MESSAGE_ACCOUNT_DEACTIVATED;
  }

  return TOAST_MESSAGE_UNEXPECTED_ERROR;
};