import { parseAsString, useQueryState } from "nuqs";

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

import { useResetPasswordForm } from "./ResetPasswordForm.hooks";

const ResetPasswordForm = () => {
  const [token] = useQueryState("token", parseAsString.withDefault(""));

  const { form, onSubmit } = useResetPasswordForm(token);
  const isSubmitting = form.formState.isSubmitting;

  if (!token) {
    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="New Password" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Confirm New Password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner className="text-white" /> : null}
          Reset Password
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
