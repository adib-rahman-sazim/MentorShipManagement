import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");

export const PAYMENTS_WEBHOOK_ROUTE = "/api/v1/payments/webhook";

export const MULTIPLE_SUBSCRIPTIONS_ALLOWED = false;

export const CHECKOUT_TRANSACTION_TIMEOUT_MS = 30_000;

export const BLOCKING_SUBSCRIPTION_STATUSES = [
  ESubscriptionStatus.ACTIVE,
  ESubscriptionStatus.TRIALING,
  ESubscriptionStatus.PAST_DUE,
  ESubscriptionStatus.UNPAID,
  ESubscriptionStatus.INCOMPLETE,
  ESubscriptionStatus.INCOMPLETE_EXPIRED,
  ESubscriptionStatus.PAUSED,
] as const;
