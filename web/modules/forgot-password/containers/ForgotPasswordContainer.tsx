import CustomLink from "@/shared/components/CustomLink";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import { Separator } from "@/shared/components/shadui/separator";

import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordContainer = () => (
  <div className="flex-1 flex items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>Enter your information below to reset your password</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />

        <Separator className="my-4" />

        <div className="flex items-center justify-center gap-1">
          <p>Already have an account?</p>
          <CustomLink href="/sign-in" label="Sign In" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ForgotPasswordContainer;
