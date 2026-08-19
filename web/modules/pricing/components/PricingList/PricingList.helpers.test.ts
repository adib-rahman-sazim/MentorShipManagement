import { describe, expect, it } from "vitest";

import {
  CANCEL_URL,
  MESSAGES,
  SUCCESS_URL,
} from "@/modules/pricing/components/PricingList/PricingList.constants";
import {
  getCheckoutRedirectUrls,
  getPricingFooterText,
  isRecurringPrice,
  sortPricesForDisplay,
} from "@/modules/pricing/components/PricingList/PricingList.helpers";
import { EPaymentCurrency, type IPriceItem } from "@/shared/typedefs/api";

const createPrice = (overrides: Partial<IPriceItem> & Pick<IPriceItem, "id">): IPriceItem => ({
  amount: 1000,
  currency: EPaymentCurrency.USD,
  product: {
    id: `prod_${overrides.id}`,
    name: "Plan",
    description: null,
  },
  recurring: null,
  ...overrides,
});

describe("PricingList.helpers", () => {
  describe("getCheckoutRedirectUrls", () => {
    it("builds success and cancel URLs from the current origin", () => {
      const origin = "https://app.example.com";

      expect(getCheckoutRedirectUrls(origin)).toEqual({
        cancelUrl: `${origin}${CANCEL_URL}`,
        successUrl: `${origin}${SUCCESS_URL}`,
      });
    });
  });

  describe("isRecurringPrice", () => {
    it("returns true when recurring is present", () => {
      expect(
        isRecurringPrice(
          createPrice({
            id: "price_recurring",
            recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
          }),
        ),
      ).toBe(true);
    });

    it("returns false when recurring is null", () => {
      expect(isRecurringPrice(createPrice({ id: "price_one_time" }))).toBe(false);
    });
  });

  describe("sortPricesForDisplay", () => {
    it("orders recurring before one-time, then by ascending amount", () => {
      const oneTimeExpensive = createPrice({ id: "ot_high", amount: 5000, recurring: null });
      const oneTimeCheap = createPrice({ id: "ot_low", amount: 2000, recurring: null });
      const recurringExpensive = createPrice({
        id: "rec_high",
        amount: 3000,
        recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
      });
      const recurringCheap = createPrice({
        id: "rec_low",
        amount: 1000,
        recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
      });

      const sorted = sortPricesForDisplay([
        oneTimeExpensive,
        recurringExpensive,
        oneTimeCheap,
        recurringCheap,
      ]);

      expect(sorted.map((price) => price.id)).toEqual(["rec_low", "rec_high", "ot_low", "ot_high"]);
    });

    it("does not mutate the input array", () => {
      const prices = [
        createPrice({ id: "ot", amount: 100, recurring: null }),
        createPrice({
          id: "rec",
          amount: 200,
          recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
        }),
      ];
      const originalOrder = prices.map((price) => price.id);

      sortPricesForDisplay(prices);

      expect(prices.map((price) => price.id)).toEqual(originalOrder);
    });
  });

  describe("getPricingFooterText", () => {
    it("returns empty message when there are no prices", () => {
      expect(getPricingFooterText([])).toBe(MESSAGES.FOOTER_EMPTY);
    });

    it("returns recurring-only copy when all prices are recurring", () => {
      expect(
        getPricingFooterText([
          createPrice({
            id: "rec",
            recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
          }),
        ]),
      ).toBe(MESSAGES.FOOTER_RECURRING_ONLY);
    });

    it("returns one-time-only copy when all prices are one-time", () => {
      expect(getPricingFooterText([createPrice({ id: "ot" })])).toBe(MESSAGES.FOOTER_ONE_TIME_ONLY);
    });

    it("returns mixed copy when both recurring and one-time prices exist", () => {
      expect(
        getPricingFooterText([
          createPrice({
            id: "rec",
            recurring: { interval: "month", intervalCount: 1, trialPeriodDays: null },
          }),
          createPrice({ id: "ot" }),
        ]),
      ).toBe(MESSAGES.FOOTER_MIXED);
    });
  });
});
