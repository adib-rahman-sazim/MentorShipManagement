import { describe, expect, it } from "vitest";

import { isAllowedCheckoutRedirectUrl } from "../payments.helpers";

describe("payments.helpers", () => {
  describe("isAllowedCheckoutRedirectUrl", () => {
    it("allows redirect URLs on the web client origin", () => {
      expect(
        isAllowedCheckoutRedirectUrl(
          "http://localhost:3000/pricing?status=success",
          "http://localhost:3000",
        ),
      ).toBe(true);
    });

    it("rejects redirect URLs on a different origin", () => {
      expect(
        isAllowedCheckoutRedirectUrl("https://example.com/success", "http://localhost:3000"),
      ).toBe(false);
    });
  });
});
