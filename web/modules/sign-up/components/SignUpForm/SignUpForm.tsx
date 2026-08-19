import React from "react";

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

import { useSignUpForm } from "./SignUpForm.hooks";
import type { TSignUpFormProps } from "./SignUpForm.types";

export const SignUpForm = ({ onEmailSent }: TSignUpFormProps) => {
  const { form, onSubmit, isEmailSent, submittedEmail, invitationToken } = useSignUpForm({
    onEmailSent,
  });
  const isSubmitting = form.formState.isSubmitting;
  const isEmailLocked = Boolean(invitationToken);

  if (isEmailSent) {
    return (
      <div className="space-y-4">
        <p>
          We&apos;ve sent a verification email to <strong>{submittedEmail}</strong>.
        </p>
        <p>Please click the link in the email to verify your account and complete sign up.</p>
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Email"
                  type="email"
                  disabled={isSubmitting || isEmailLocked}
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Password" disabled={isSubmitting} {...field} />
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
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Confirm Password" disabled={isSubmitting} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner /> : null}
          Sign Up
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
