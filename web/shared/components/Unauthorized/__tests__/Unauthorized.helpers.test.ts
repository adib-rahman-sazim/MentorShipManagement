import { describe, expect, it } from "vitest";

import { EPermission, EResource } from "@/shared/typedefs";

import { getDefaultAuthorizedRoute } from "../Unauthorized.helpers";

const SETTINGS_ROUTE = "/settings";

describe("Unauthorized.helpers", () => {
  describe("getDefaultAuthorizedRoute", () => {
    it("returns settings when dashboard is denied but settings is allowed", () => {
      const can = (action: EPermission, resource: EResource | "all") =>
        action === EPermission.PAGE_VIEW && resource === EResource.SETTINGS;

      expect(getDefaultAuthorizedRoute(can)).toBe(SETTINGS_ROUTE);
    });
  });
});
