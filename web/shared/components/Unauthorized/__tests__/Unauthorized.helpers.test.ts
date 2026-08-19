import { describe, expect, it } from "vitest";

import { AI_CHAT_ROUTE, DASHBOARD_ROUTE, USERS_ROUTE } from "@/shared/constants/routes.constants";
import { EPermission, EResource } from "@/shared/typedefs";

import { getDefaultAuthorizedRoute } from "../Unauthorized.helpers";

describe("Unauthorized.helpers", () => {
  describe("getDefaultAuthorizedRoute", () => {
    it("returns dashboard when user can page_view dashboard", () => {
      const can = (action: EPermission, resource: EResource | "all") =>
        action === EPermission.PAGE_VIEW && resource === EResource.DASHBOARD;

      expect(getDefaultAuthorizedRoute(can)).toBe(DASHBOARD_ROUTE);
    });

    it("returns ai-chat when dashboard is denied but ai_chat is allowed", () => {
      const can = (action: EPermission, resource: EResource | "all") =>
        action === EPermission.PAGE_VIEW && resource === EResource.AI_CHAT;

      expect(getDefaultAuthorizedRoute(can)).toBe(AI_CHAT_ROUTE);
    });

    it("returns users when only user page_view is allowed", () => {
      const can = (action: EPermission, resource: EResource | "all") =>
        action === EPermission.PAGE_VIEW && resource === EResource.USER;

      expect(getDefaultAuthorizedRoute(can)).toBe(USERS_ROUTE);
    });

    it("returns dashboard as fallback when no page_view permissions match", () => {
      expect(getDefaultAuthorizedRoute(() => false)).toBe(DASHBOARD_ROUTE);
    });
  });
});
