import { PasswordInput } from "@/shared/components/Form/PasswordInput";
import LoadingSpinner from "@/shared/components/LoadingSpinner";
import { Button } from "@/shared/components/shadui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/shadui/form";
import { Input } from "@/shared/components/shadui/input";

import {
  SIGN_IN_EMAIL_LABEL,
  SIGN_IN_EMAIL_PLACEHOLDER,
  SIGN_IN_PASSWORD_LABEL,
  SIGN_IN_PASSWORD_PLACEHOLDER,
  SIGN_IN_SUBMIT_LABEL,
  SIGN_IN_SUBMITTING_LABEL,
} from "./SignInForm.constants";
import { useSignInForm } from "./SignInForm.hooks";




export const SignInForm = () => {
  const { form, onSubmit } = useSignInForm();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SIGN_IN_EMAIL_LABEL}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={SIGN_IN_EMAIL_PLACEHOLDER}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{SIGN_IN_PASSWORD_LABEL}</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder={SIGN_IN_PASSWORD_PLACEHOLDER}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="text-primary-foreground" />
              <span className="ml-2">{SIGN_IN_SUBMITTING_LABEL}</span>
            </>
          ) : (
            SIGN_IN_SUBMIT_LABEL
          )}
        </Button>
      </form>
    </Form>
  );
};