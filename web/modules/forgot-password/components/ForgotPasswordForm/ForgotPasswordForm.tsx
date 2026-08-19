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

import { useForgotPasswordForm } from "./ForgotPasswordForm.hooks";

const ForgotPasswordForm = () => {
  const { form, onSubmit, isSuccess } = useForgotPasswordForm();
  const isSubmitting = form.formState.isSubmitting;
  const email = form.watch("email");

  if (isSuccess && email) {
    return (
      <div className="w-full h-full grid place-items-center">
        <p className="text text-primary text-md">
          Reset link sent to your email: <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          disabled={isSubmitting}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" disabled={isSubmitting} type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner /> : null}
          Send Reset Link
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
