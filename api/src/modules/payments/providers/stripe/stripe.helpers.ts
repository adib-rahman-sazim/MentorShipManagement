import dayjs from "dayjs";
// biome-ignore lint/correctness/noUnresolvedImports: stripe ambient declare module is not resolved by biome
import Stripe from "stripe";

import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";

import type { IProviderSubscription } from "../../payments.interfaces";

export function getSubscriptionStatus(stripeStatus: string): ESubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return ESubscriptionStatus.ACTIVE;
    case "trialing":
      return ESubscriptionStatus.TRIALING;
    case "past_due":
      return ESubscriptionStatus.PAST_DUE;
    case "unpaid":
      return ESubscriptionStatus.UNPAID;
    case "paused":
      return ESubscriptionStatus.PAUSED;
    case "incomplete":
      return ESubscriptionStatus.INCOMPLETE;
    case "incomplete_expired":
      return ESubscriptionStatus.INCOMPLETE_EXPIRED;
    case "canceled":
      return ESubscriptionStatus.CANCELLED;
    default:
      throw new Error(`Unsupported Stripe subscription status: ${stripeStatus}`);
  }
}

export function getDateFromEpochSeconds(timestamp: number): Date {
  return dayjs.unix(timestamp).toDate();
}

export function getProviderSubscriptionFromStripeSubscription(
  subscription: Stripe.Subscription,
): IProviderSubscription {
  const subscriptionItem = subscription.items.data[0];

  return {
    id: subscription.id,
    customerId: subscription.customer as string,
    priceId: subscriptionItem.price.id,
    status: getSubscriptionStatus(subscription.status),
    currentPeriodStartAt: getDateFromEpochSeconds(subscriptionItem.current_period_start),
    currentPeriodEndAt: getDateFromEpochSeconds(subscriptionItem.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
