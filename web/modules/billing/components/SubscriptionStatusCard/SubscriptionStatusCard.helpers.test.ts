import { describe, expect, it } from "vitest";

import {
  getCurrentSubscription,
  getStatusLabel,
  getSubscriptionStatusBadgeVariant,
} from "@/modules/billing/components/SubscriptionStatusCard/SubscriptionStatusCard.helpers";
import { ESubscriptionStatus, type ISubscriptionDto } from "@/shared/typedefs/api";

describe("SubscriptionStatusCard.helpers", () => {
  describe("getCurrentSubscription", () => {
    const createSubscription = (id: string, status: ESubscriptionStatus): ISubscriptionDto => ({
      cancelAtPeriodEnd: false,
      createdAt: "2026-07-03T00:00:00.000Z",
      currentPeriodEndAt: "2026-08-03T00:00:00.000Z",
      currentPeriodStartAt: "2026-07-03T00:00:00.000Z",
      id,
      priceId: "price_starter",
      status,
      updatedAt: "2026-07-03T00:00:00.000Z",
    });

    it("returns a non-cancelled actionable subscription", () => {
      const pausedSubscription = createSubscription("sub_paused", ESubscriptionStatus.PAUSED);

      expect(
        getCurrentSubscription([
          createSubscription("sub_cancelled", ESubscriptionStatus.CANCELLED),
          pausedSubscription,
        ]),
      ).toBe(pausedSubscription);
    });

    it("returns the highest-priority actionable subscription", () => {
      const activeSubscription = createSubscription("sub_active", ESubscriptionStatus.ACTIVE);

      expect(
        getCurrentSubscription([
          createSubscription("sub_unpaid", ESubscriptionStatus.UNPAID),
          createSubscription("sub_trialing", ESubscriptionStatus.TRIALING),
          activeSubscription,
          createSubscription("sub_past_due", ESubscriptionStatus.PAST_DUE),
        ]),
      ).toBe(activeSubscription);
    });

    it("returns null when only cancelled subscriptions exist", () => {
      expect(
        getCurrentSubscription([
          createSubscription("sub_cancelled", ESubscriptionStatus.CANCELLED),
        ]),
      ).toBeNull();
    });
  });

  describe("getSubscriptionStatusBadgeVariant", () => {
    it.each([
      [ESubscriptionStatus.ACTIVE, "default"],
      [ESubscriptionStatus.CANCELLED, "destructive"],
      [ESubscriptionStatus.INCOMPLETE, "destructive"],
      [ESubscriptionStatus.INCOMPLETE_EXPIRED, "destructive"],
      [ESubscriptionStatus.PAST_DUE, "destructive"],
      [ESubscriptionStatus.PAUSED, "secondary"],
      [ESubscriptionStatus.TRIALING, "secondary"],
      [ESubscriptionStatus.UNPAID, "destructive"],
    ])("returns %s badge variant", (status, variant) => {
      expect(getSubscriptionStatusBadgeVariant(status)).toBe(variant);
    });

    it("returns outline for unknown status", () => {
      expect(getSubscriptionStatusBadgeVariant("unknown" as ESubscriptionStatus)).toBe("outline");
    });
  });

  describe("getStatusLabel", () => {
    it.each([
      [ESubscriptionStatus.ACTIVE, "Active"],
      [ESubscriptionStatus.CANCELLED, "Cancelled"],
      [ESubscriptionStatus.INCOMPLETE, "Incomplete"],
      [ESubscriptionStatus.INCOMPLETE_EXPIRED, "Incomplete expired"],
      [ESubscriptionStatus.PAST_DUE, "Past due"],
      [ESubscriptionStatus.PAUSED, "Paused"],
      [ESubscriptionStatus.TRIALING, "Trialing"],
      [ESubscriptionStatus.UNPAID, "Unpaid"],
    ])("returns %s label", (status, label) => {
      expect(getStatusLabel(status)).toBe(label);
    });
  });
});
