import { describe, expect, it } from "vitest";

import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import {
  createPermission,
  parsePermissionString,
} from "@/utils/permission-string/permission-string.helpers";

describe("permission-string.helpers", () => {
  it("creates and parses unconditional permission strings", () => {
    const code = createPermission(EResource.USER, EPermission.LIST);
    expect(code).toBe("user:list:allow");
    expect(parsePermissionString(code)).toEqual({
      resource: EResource.USER,
      action: EPermission.LIST,
      conditionType: "none",
      denied: false,
    });
  });

  it("creates page_view permissions", () => {
    expect(createPermission(EResource.DASHBOARD, EPermission.PAGE_VIEW)).toBe(
      "dashboard:page_view:allow",
    );
  });
});
