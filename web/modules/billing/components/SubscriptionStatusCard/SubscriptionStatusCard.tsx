import { useState } from "react";

import Link from "next/link";

import { format, parseISO } from "date-fns";
import { toast } from "sonner";

import {
  getCurrentSubscription,
  getStatusLabel,
  getSubscriptionStatusBadgeVariant,
} from "@/modules/billing/components/SubscriptionStatusCard/SubscriptionStatusCard.helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/shadui/alert-dialog";
import { Badge } from "@/shared/components/shadui/badge";
import { Button } from "@/shared/components/shadui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";
import { PRICING_ROUTE } from "@/shared/constants/routes.constants";
import {
  useCancelSubscriptionMutation,
  useGetSubscriptionsListQuery,
  useResumeSubscriptionMutation,
} from "@/shared/redux/rtk-apis/payments/payments.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const SubscriptionStatusCard = () => {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const {
    data: subscriptionsResponse,
    isError: isSubscriptionsError,
    isLoading: isSubscriptionsLoading,
  } = useGetSubscriptionsListQuery();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();
  const [resumeSubscription, { isLoading: isResuming }] = useResumeSubscriptionMutation();

  const activeSubscription = getCurrentSubscription(subscriptionsResponse?.data ?? []);

  const handleCancelSubscription = async () => {
    if (!activeSubscription) {
      return;
    }
    try {
      setIsCancelDialogOpen(false);
      await cancelSubscription(activeSubscription.id).unwrap();
      toast.success("Subscription will be cancelled at the end of the current billing period.");
    } catch (error) {
      toast.error("Failed to cancel subscription", { description: parseApiErrorMessage(error) });
    }
  };

  const handleResumeSubscription = async () => {
    if (!activeSubscription) {
      return;
    }

    try {
      setIsResumeDialogOpen(false);
      await resumeSubscription(activeSubscription.id).unwrap();
      toast.success(
        "Subscription resumed successfully. You will be charged the next billing period.",
      );
    } catch (error) {
      toast.error("Failed to resume subscription", { description: parseApiErrorMessage(error) });
    }
  };

  if (isSubscriptionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (isSubscriptionsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Unable to load subscription information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Refresh the page or try again later.</div>
        </CardContent>
      </Card>
    );
  }

  if (!activeSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>No active subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">You don&apos;t have an active subscription.</div>
          <Link href={PRICING_ROUTE}>
            <Button className="w-full">View Pricing Plans</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Current subscription information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={getSubscriptionStatusBadgeVariant(activeSubscription.status)}>
              {getStatusLabel(activeSubscription.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Started At</span>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(activeSubscription.currentPeriodStartAt), "PPP")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Subscription Ends At</span>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(activeSubscription.currentPeriodEndAt), "PPP")}
            </span>
          </div>
          {activeSubscription.cancelAtPeriodEnd ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cancellation</span>
              <span className="text-sm text-muted-foreground">Will cancel at period end</span>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          {activeSubscription.cancelAtPeriodEnd ? (
            <Button
              variant="outline"
              disabled={isResuming}
              onClick={() => setIsResumeDialogOpen(true)}
            >
              {isResuming ? "Resuming..." : "Resume Subscription"}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => setIsCancelDialogOpen(true)}
            >
              {isCancelling ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          )}
        </CardFooter>
      </Card>
      <AlertDialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resume Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resume your subscription? You will be charged the next
              billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-2 rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              You&apos;ll be charged the next billing period on
            </span>
            <span className="font-medium">
              {format(parseISO(activeSubscription.currentPeriodEndAt), "PPPP")}
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={isResuming}
              onClick={handleResumeSubscription}
            >
              Confirm Resumption
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to all premium
              features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col space-y-2 rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">
              Your subscription will remain active until
            </span>
            <span className="font-medium">
              {format(parseISO(activeSubscription.currentPeriodEndAt), "PPPP")}
            </span>
          </div>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={isCancelling}
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Cancellation
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
