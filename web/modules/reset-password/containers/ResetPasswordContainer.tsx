import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/shadui/card";

import ResetPasswordForm from "../components/ResetPasswordForm";

const ResetPasswordContainer = () => (
  <div className="flex-1 flex items-center justify-center p-4">
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm />
      </CardContent>
    </Card>
  </div>
);

export default ResetPasswordContainer;
