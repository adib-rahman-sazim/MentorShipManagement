import { describe, expect, it } from "vitest";

import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";

import { getDateFromEpochSeconds, getSubscriptionStatus } from "../stripe.helpers";

describe("stripe.helpers", () => {
  describe("getSubscriptionStatus", () => {
    it("active", () => expect(getSubscriptionStatus("active")).toBe(ESubscriptionStatus.ACTIVE));
    it("trialing", () =>
      expect(getSubscriptionStatus("trialing")).toBe(ESubscriptionStatus.TRIALING));

    it("canceled", () =>
      expect(getSubscriptionStatus("canceled")).toBe(ESubscriptionStatus.CANCELLED));

    it("past_due", () =>
      expect(getSubscriptionStatus("past_due")).toBe(ESubscriptionStatus.PAST_DUE));
    it("unpaid", () => expect(getSubscriptionStatus("unpaid")).toBe(ESubscriptionStatus.UNPAID));
    it("paused", () => expect(getSubscriptionStatus("paused")).toBe(ESubscriptionStatus.PAUSED));
    it("incomplete", () =>
      expect(getSubscriptionStatus("incomplete")).toBe(ESubscriptionStatus.INCOMPLETE));
    it("incomplete_expired", () =>
      expect(getSubscriptionStatus("incomplete_expired")).toBe(
        ESubscriptionStatus.INCOMPLETE_EXPIRED,
      ));

    it("throws for unsupported status", () => {
      expect(() => getSubscriptionStatus("unsupported")).toThrow(
        "Unsupported Stripe subscription status: unsupported",
      );
    });
  });

  describe("getDateFromEpochSeconds", () => {
    it("should return the date from the epoch seconds", () => {
      expect(getDateFromEpochSeconds(1771409410)).toEqual(new Date("2026-02-18T10:10:10.000Z"));
    });
  });
});
