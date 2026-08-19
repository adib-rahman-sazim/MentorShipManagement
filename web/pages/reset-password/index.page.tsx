import { useRouter } from "next/router";

import { parseAsString, useQueryState } from "nuqs";

import ResetPasswordContainer from "@/modules/reset-password/containers/ResetPasswordContainer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/shadui/card";
import PublicRoute from "@/shared/components/wrappers/PublicRoute";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { NextApplicationPage } from "@/shared/typedefs";

const ResetPasswordPage: NextApplicationPage = () => {
  const router = useRouter();
  const [token] = useQueryState("token", parseAsString.withDefault(""));

  const isReady = router.isReady;

  if (!isReady) {
    return null;
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid Token</CardTitle>
            <CardDescription>
              No reset token provided. Please check the link in your email and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return <ResetPasswordContainer />;
};

ResetPasswordPage.Layout = GeneralLayout;
ResetPasswordPage.Guard = PublicRoute;

export default ResetPasswordPage;
