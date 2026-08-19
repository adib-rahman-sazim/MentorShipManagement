import CustomLink from "@/shared/components/CustomLink";
import { Button } from "@/shared/components/shadui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import SystemInvitePageSkeleton from "@/shared/components/skeletons/SystemInvitePageSkeleton";
import { HOME_ROUTE } from "@/shared/constants/routes.constants";

import { useAcceptSystemInvitation } from "./AcceptSystemInvitationContainer.hooks";

const AcceptSystemInvitationContainer = () => {
  const { token, invitation, isLoading, isError, handleEmailSignUp } = useAcceptSystemInvitation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <SystemInvitePageSkeleton />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid Invitation Link</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>No invitation token provided. Please check the link in your email.</p>
            <CustomLink href={HOME_ROUTE} label="Go Home" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>This invitation is invalid or has expired. Please contact your administrator.</p>
            <CustomLink href={HOME_ROUTE} label="Go Home" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to join as <strong>{invitation.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Invited by: {invitation.inviterEmail}</p>
          <p className="text-sm text-muted-foreground">Email: {invitation.email}</p>
          <Button onClick={handleEmailSignUp} className="w-full" type="button">
            Continue to Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptSystemInvitationContainer;
