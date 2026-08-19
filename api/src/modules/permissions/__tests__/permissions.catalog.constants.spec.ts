import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import { DEFAULT_ROLE_PERMISSION_CODES } from "@/modules/permissions/permissions.catalog.constants";

describe("permissions catalog", () => {
  it("gives super_admin all:manage", () => {
    expect(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SUPER_ADMIN]).toContain("all:manage:allow");
  });

  it("gives customer user list/read and page views without user page_view", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.CUSTOMER];
    expect(codes).toContain("user:list:allow");
    expect(codes).toContain("user:read:allow");
    expect(codes).toContain("dashboard:page_view:allow");
    expect(codes).not.toContain("user:page_view:allow");
  });

  it("gives manager user update but not user page_view", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MANAGER];
    expect(codes).toContain("user:update:allow");
    expect(codes).not.toContain("user:page_view:allow");
  });

  it("gives customer invitation and organization create permissions", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.CUSTOMER];
    expect(codes).toContain("invitation:list:allow");
    expect(codes).toContain("invitation:create:allow");
    expect(codes).toContain("invitation:cancel:allow");
    expect(codes).toContain("organization:create:allow");
    expect(codes).toContain("organization:page_view:allow");
  });

  it("gives manager organization page_view but not create", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MANAGER];
    expect(codes).not.toContain("organization:create:allow");
    expect(codes).toContain("organization:page_view:allow");
  });
});
