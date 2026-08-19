import { useRouter } from "next/router";

import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";
import { signIn } from "@/shared/lib/auth-client";
import { resolvePostAuthDestinationFromSession } from "@/shared/utils/postAuthDestination";
import { isSafePostAuthRedirect, persistPostAuthRedirect } from "@/shared/utils/postAuthRedirect";

import { signInFormInitialValues, signInFormValidationSchemaResolver } from "./SignInForm.helpers";
import { TSignInFormFields } from "./SignInForm.types";

export const useSignInForm = () => {
  const router = useRouter();
  const redirectQuery = router.query["redirect"];
  const redirect =
    typeof redirectQuery === "string" && isSafePostAuthRedirect(redirectQuery)
      ? redirectQuery
      : DASHBOARD_ROUTE;

  const form = useForm<TSignInFormFields>({
    defaultValues: signInFormInitialValues,
    resolver: signInFormValidationSchemaResolver,
    reValidateMode: "onBlur",
  });

  const onSubmit = async (values: TSignInFormFields) => {
    const result = await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token");
          if (authToken) {
            localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, authToken);
          }
        },
      },
    );

    if (result.error) {
      toast.error("Sign In failed", {
        description: result.error.message || "Invalid credentials",
      });
      return;
    }

    if (redirect !== DASHBOARD_ROUTE) {
      persistPostAuthRedirect(redirect);
    }

    const nextPath = await resolvePostAuthDestinationFromSession({
      storedRedirect: redirect !== DASHBOARD_ROUTE ? redirect : null,
    });

    toast.success("Signed in successfully");
    router.push(nextPath);
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
