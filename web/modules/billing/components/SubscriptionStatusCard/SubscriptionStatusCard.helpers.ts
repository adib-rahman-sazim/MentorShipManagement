import { ESubscriptionStatus, type ISubscriptionDto } from "@/shared/typedefs/api";

import { CURRENT_SUBSCRIPTION_STATUS_PRIORITY } from "./SubscriptionStatusCard.constants";

export const getCurrentSubscription = (subscriptions: ISubscriptionDto[]) =>
  CURRENT_SUBSCRIPTION_STATUS_PRIORITY.map((status) =>
    subscriptions.find((subscription) => subscription.status === status),
  ).find(Boolean) ?? null;

export const getSubscriptionStatusBadgeVariant = (status: ESubscriptionStatus) => {
  switch (status) {
    case ESubscriptionStatus.ACTIVE:
      return "default";
    case ESubscriptionStatus.CANCELLED:
      return "destructive";
    case ESubscriptionStatus.INCOMPLETE:
    case ESubscriptionStatus.INCOMPLETE_EXPIRED:
    case ESubscriptionStatus.PAST_DUE:
    case ESubscriptionStatus.UNPAID:
      return "destructive";
    case ESubscriptionStatus.PAUSED:
    case ESubscriptionStatus.TRIALING:
      return "secondary";
    default:
      return "outline";
  }
};

export const getStatusLabel = (status: ESubscriptionStatus) => {
  switch (status) {
    case ESubscriptionStatus.ACTIVE:
      return "Active";
    case ESubscriptionStatus.CANCELLED:
      return "Cancelled";
    case ESubscriptionStatus.INCOMPLETE:
      return "Incomplete";
    case ESubscriptionStatus.INCOMPLETE_EXPIRED:
      return "Incomplete expired";
    case ESubscriptionStatus.PAST_DUE:
      return "Past due";
    case ESubscriptionStatus.PAUSED:
      return "Paused";
    case ESubscriptionStatus.TRIALING:
      return "Trialing";
    case ESubscriptionStatus.UNPAID:
      return "Unpaid";
  }
};
