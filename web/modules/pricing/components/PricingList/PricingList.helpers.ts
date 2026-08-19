import {
  CANCEL_URL,
  MESSAGES,
  SUCCESS_URL,
} from "@/modules/pricing/components/PricingList/PricingList.constants";
import type { IPriceItem } from "@/shared/typedefs/api";

export const getCheckoutRedirectUrls = (origin: string) => ({
  cancelUrl: `${origin}${CANCEL_URL}`,
  successUrl: `${origin}${SUCCESS_URL}`,
});

export const isRecurringPrice = (price: IPriceItem): boolean => !!price.recurring;

export const sortPricesForDisplay = (prices: IPriceItem[]): IPriceItem[] =>
  [...prices].sort((a, b) => {
    const aRecurring = isRecurringPrice(a);
    const bRecurring = isRecurringPrice(b);

    if (aRecurring !== bRecurring) {
      return aRecurring ? -1 : 1;
    }

    return a.amount - b.amount;
  });

export const getPricingFooterText = (prices: IPriceItem[]): string => {
  if (prices.length === 0) {
    return MESSAGES.FOOTER_EMPTY;
  }

  const hasRecurring = prices.some(isRecurringPrice);
  const hasOneTime = prices.some((price) => !isRecurringPrice(price));

  if (hasRecurring && hasOneTime) {
    return MESSAGES.FOOTER_MIXED;
  }

  if (hasRecurring) {
    return MESSAGES.FOOTER_RECURRING_ONLY;
  }

  return MESSAGES.FOOTER_ONE_TIME_ONLY;
};
