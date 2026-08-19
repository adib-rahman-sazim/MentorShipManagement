import CustomLink from "@/shared/components/CustomLink";
import { Button } from "@/shared/components/shadui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import InviteAcceptPageSkeleton from "@/shared/components/skeletons/InviteAcceptPageSkeleton";
import { HOME_ROUTE } from "@/shared/constants/routes.constants";

import { useAcceptInvitation } from "./AcceptInvitationContainer.hooks";

const AcceptInvitationContainer = () => {
  const {
    token,
    invitation,
    isLoading,
    isError,
    isAuthenticated,
    isAccepting,
    isAccepted,
    error,
    handleAcceptInvitation,
    handleEmailSignUp,
    handleSignIn,
  } = useAcceptInvitation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <InviteAcceptPageSkeleton />
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

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Accept Organization Invitation</CardTitle>
            <CardDescription>
              You have been invited to join &quot;{invitation.organizationName}&quot; as{" "}
              <strong>{invitation.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Invited by: {invitation.inviterEmail}</p>
            <p className="text-sm text-muted-foreground">Email: {invitation.email}</p>
            <p>
              Please create and verify your account first, then return to this page to accept the
              invitation.
            </p>
            <Button onClick={handleEmailSignUp} className="w-full" type="button">
              Create an account
            </Button>
            <Button onClick={handleSignIn} className="w-full" type="button" variant="outline">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccepting) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Accepting Invitation...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we add you to the organization.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invitation Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error}</p>
            <Button onClick={handleAcceptInvitation}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You have successfully joined the organization. Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Accept Organization Invitation</CardTitle>
          <CardDescription>
            You have been invited to join &quot;{invitation.organizationName}&quot; as{" "}
            {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Invited by: {invitation.inviterEmail}</p>
          <p>Click the button below to accept the invitation and join the organization.</p>
          <Button onClick={handleAcceptInvitation} className="w-full">
            Accept Invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationContainer;
