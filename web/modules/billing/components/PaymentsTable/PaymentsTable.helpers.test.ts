import { describe, expect, it } from "vitest";

import {
  formatAmount,
  formatPaymentDate,
  getPaymentStatusBadgeVariant,
  getPaymentTableRows,
  getPaymentTypeLabel,
} from "@/modules/billing/components/PaymentsTable/PaymentsTable.helpers";
import {
  EPaymentCurrency,
  EPaymentStatus,
  EPaymentType,
  type IPaymentItem,
} from "@/shared/typedefs/api";

describe("PaymentsTable.helpers", () => {
  describe("getPaymentStatusBadgeVariant", () => {
    it("returns default for Succeeded", () => {
      expect(getPaymentStatusBadgeVariant(EPaymentStatus.SUCCEEDED)).toBe("default");
    });

    it("returns secondary for Pending", () => {
      expect(getPaymentStatusBadgeVariant(EPaymentStatus.PENDING)).toBe("secondary");
    });

    it("returns destructive for Failed", () => {
      expect(getPaymentStatusBadgeVariant(EPaymentStatus.FAILED)).toBe("destructive");
    });

    it("returns outline for unknown status", () => {
      expect(getPaymentStatusBadgeVariant("unknown" as EPaymentStatus)).toBe("outline");
    });
  });

  describe("formatAmount", () => {
    it("formats amount in cents as currency", () => {
      expect(formatAmount(999, EPaymentCurrency.USD)).toBe("$9.99");
    });

    it("divides amount by 100", () => {
      expect(formatAmount(10000, EPaymentCurrency.USD)).toBe("$100.00");
    });

    it("uses provided language for locale", () => {
      expect(formatAmount(1000, EPaymentCurrency.USD, "en-US")).toBe("$10.00");
    });
  });

  describe("formatPaymentDate", () => {
    it("formats ISO payment dates", () => {
      expect(formatPaymentDate("2026-07-03T00:00:00.000Z")).toBe("July 3rd, 2026");
    });
  });

  describe("getPaymentTypeLabel", () => {
    it("returns Recurring for recurring payments", () => {
      expect(getPaymentTypeLabel(EPaymentType.RECURRING)).toBe("Recurring");
    });

    it("returns One-time for one-off payments", () => {
      expect(getPaymentTypeLabel(EPaymentType.ONE_OFF)).toBe("One-time");
    });
  });

  describe("getPaymentTableRows", () => {
    it("maps payment DTOs to preformatted table rows", () => {
      const payments: IPaymentItem[] = [
        {
          amount: 999,
          createdAt: "2026-07-03T00:00:00.000Z",
          currency: EPaymentCurrency.USD,
          description: "Starter Plan",
          id: "payment_123456789",
          priceId: "price_starter",
          quantity: 1,
          status: EPaymentStatus.SUCCEEDED,
          type: EPaymentType.RECURRING,
          updatedAt: "2026-07-03T00:00:00.000Z",
        },
      ];

      expect(getPaymentTableRows(payments)).toEqual([
        {
          description: "Starter Plan",
          formattedAmount: "$9.99",
          formattedDate: "July 3rd, 2026",
          id: "payment_123456789",
          shortId: "payment_...",
          status: EPaymentStatus.SUCCEEDED,
          typeLabel: "Recurring",
        },
      ]);
    });
  });
});
