import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  INVITATION_TOKEN_QUERY_PARAM,
  X_INVITATION_TOKEN_HEADER,
} from "@/shared/constants/invitation.constants";
import { signUp } from "@/shared/lib/auth-client";
import { persistPostAuthRedirect } from "@/shared/utils/postAuthRedirect";

import { signUpFormInitialValues, signUpFormValidationSchemaResolver } from "./SignUpForm.helpers";
import { TSignUpFormFields, TUseSignUpFormOptions } from "./SignUpForm.types";

export const useSignUpForm = (options?: TUseSignUpFormOptions) => {
  const router = useRouter();
  const [invitationToken] = useQueryState(
    INVITATION_TOKEN_QUERY_PARAM,
    parseAsString.withDefault(""),
  );
  const [emailFromQuery] = useQueryState("email", parseAsString.withDefault(""));
  const [firstNameFromQuery] = useQueryState("firstName", parseAsString.withDefault(""));
  const [lastNameFromQuery] = useQueryState("lastName", parseAsString.withDefault(""));
  const [redirectFromQuery] = useQueryState("redirect", parseAsString.withDefault(""));

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<TSignUpFormFields>({
    defaultValues: signUpFormInitialValues,
    resolver: signUpFormValidationSchemaResolver,
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    if (!router.isReady || !redirectFromQuery) {
      return;
    }

    persistPostAuthRedirect(redirectFromQuery);
  }, [router.isReady, redirectFromQuery]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!emailFromQuery && !firstNameFromQuery && !lastNameFromQuery) {
      return;
    }

    form.reset({
      ...signUpFormInitialValues,
      email: emailFromQuery || signUpFormInitialValues.email,
      firstName: firstNameFromQuery || signUpFormInitialValues.firstName,
      lastName: lastNameFromQuery || signUpFormInitialValues.lastName,
    });
  }, [router.isReady, emailFromQuery, firstNameFromQuery, lastNameFromQuery, form]);

  const onSubmit = async (values: TSignUpFormFields) => {
    const result = await signUp.email({
      email: values.email,
      password: values.password,
      name: `${values.firstName} ${values.lastName}`,
      firstName: values.firstName,
      lastName: values.lastName,
      ...(invitationToken
        ? {
            fetchOptions: {
              headers: {
                [X_INVITATION_TOKEN_HEADER]: invitationToken,
              },
            },
          }
        : {}),
    } as Parameters<typeof signUp.email>[0]);

    if (result.error) {
      toast.error("Sign Up failed", {
        description: result.error.message || "Could not create account",
      });
      return;
    }

    setSubmittedEmail(values.email);
    setIsEmailSent(true);
    toast.success("Account created! Please check your email to verify.");
    options?.onEmailSent?.(values.email);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isEmailSent,
    submittedEmail,
    invitationToken,
  };
};
