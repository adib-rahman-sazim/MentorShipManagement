import { PRICING_ROUTE } from "@/shared/constants/routes.constants";

export const STATUS_QUERY_PARAM = "status";
export const SUCCESS_STATUS = "success";
export const CANCELED_STATUS = "canceled";
export const SUCCESS_URL = `${PRICING_ROUTE}?status=${SUCCESS_STATUS}`;
export const CANCEL_URL = `${PRICING_ROUTE}?status=${CANCELED_STATUS}`;

export const MESSAGES = {
  PAYMENT_SUCCESS: "Payment successful!",
  PAYMENT_CANCELED: "Payment canceled.",
  INITIATE_CHECKOUT_ERROR: "Failed to initiate checkout",
  FOOTER_RECURRING_ONLY: "All plans include a 14-day money-back guarantee. Cancel anytime.",
  FOOTER_ONE_TIME_ONLY: "All plans include a 14-day money-back guarantee.",
  FOOTER_MIXED:
    "All plans include a 14-day money-back guarantee. Subscriptions can be canceled anytime.",
  FOOTER_EMPTY: "No plans found.",
} as const;
