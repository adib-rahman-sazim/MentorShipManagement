export enum EPaymentProvider {
  STRIPE = "stripe",
}

export enum EPaymentWebhookEvent {
  CHECKOUT_COMPLETED = "checkout_completed",
  PAYMENT_SUCCEEDED = "payment_succeeded",
  SUBSCRIPTION_UPDATED = "subscription_updated",
  CHECKOUT_EXPIRED = "checkout_expired",
  UNHANDLED = "unhandled_event",
}

export enum EPaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

export enum EPaymentCurrency {
  USD = "usd",
}

export enum EPaymentType {
  RECURRING = "recurring",
  ONE_OFF = "one_off",
}
