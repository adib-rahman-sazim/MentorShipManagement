import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/shared/lib/auth-client";
import {
  getPostAuthDestination,
  isSafePostAuthRedirect,
  persistPostAuthRedirect,
} from "@/shared/utils/postAuthRedirect";

import {
  getSignInErrorMessage,
  signInFormInitialValues,
  signInFormValidationSchemaResolver,
} from "./SignInForm.helpers";
import { TSignInFormFields } from "./SignInForm.types";

export const useSignInForm = () => {
  const router = useRouter();
  const redirectQuery = router.query["redirect"];
  const redirect =
    typeof redirectQuery === "string" && isSafePostAuthRedirect(redirectQuery)
      ? redirectQuery
      : null;

  const form = useForm<TSignInFormFields>({
    defaultValues: signInFormInitialValues,
    resolver: signInFormValidationSchemaResolver,
    reValidateMode: "onBlur",
  });

  const onSubmit = async (values: TSignInFormFields) => {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
    });

    if (result.error) {
      toast.error(getSignInErrorMessage(result.error));
      return;
    }

    if (redirect) {
      persistPostAuthRedirect(redirect);
    }

    router.replace(getPostAuthDestination(redirect));
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
