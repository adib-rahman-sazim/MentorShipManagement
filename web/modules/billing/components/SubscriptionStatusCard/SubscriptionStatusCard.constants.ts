import { ESubscriptionStatus } from "@/shared/typedefs/api";

export const CURRENT_SUBSCRIPTION_STATUS_PRIORITY = [
  ESubscriptionStatus.ACTIVE,
  ESubscriptionStatus.TRIALING,
  ESubscriptionStatus.PAST_DUE,
  ESubscriptionStatus.UNPAID,
  ESubscriptionStatus.PAUSED,
  ESubscriptionStatus.INCOMPLETE,
  ESubscriptionStatus.INCOMPLETE_EXPIRED,
];
