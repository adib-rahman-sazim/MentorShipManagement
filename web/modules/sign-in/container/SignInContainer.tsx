import React from "react";

import { FaGoogle, FaLink } from "react-icons/fa";

import CustomLink from "@/shared/components/CustomLink";
import { Button } from "@/shared/components/shadui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import { Separator } from "@/shared/components/shadui/separator";
import { AUTH_CALLBACK_ROUTE } from "@/shared/constants/routes.constants";
import { signIn } from "@/shared/lib/auth-client";

import { SignInForm } from "../components/SignInForm";

const SignInContainer = () => {
  const handleGoogleSignIn = async () => {
    const callbackURL = `${window.location.origin}${AUTH_CALLBACK_ROUTE}`;
    await signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Sign-in to your account</CardTitle>
          <CardDescription>Enter your credentials to sign-in</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
          <CustomLink href="/forgot-password" label="Forgot Password?" className="my-4" />

          <Separator className="my-4" />

          <div className="flex flex-col space-y-4">
            <Button variant="outline">
              <FaLink /> Sign In with Magic Link
            </Button>
            <Button variant="outline" onClick={handleGoogleSignIn}>
              <FaGoogle /> Sign In with Google
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-center gap-1">
            <p>Don&rsquo;t have an account?</p>
            <CustomLink href="/sign-up" label="Sign Up" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInContainer;
