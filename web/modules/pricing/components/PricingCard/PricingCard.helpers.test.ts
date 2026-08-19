import { describe, expect, it } from "vitest";

import { formatPrice } from "@/modules/pricing/components/PricingCard/PricingCard.helpers";
import { EPaymentCurrency } from "@/shared/typedefs/api";

describe("PricingCard.helpers", () => {
  describe("formatPrice", () => {
    it("formats price in cents as currency", () => {
      expect(formatPrice(999, EPaymentCurrency.USD)).toBe("$9.99");
    });

    it("divides price by 100", () => {
      expect(formatPrice(10000, EPaymentCurrency.USD)).toBe("$100.00");
    });

    it("formats zero", () => {
      expect(formatPrice(0, EPaymentCurrency.USD)).toBe("$0.00");
    });
  });
});
