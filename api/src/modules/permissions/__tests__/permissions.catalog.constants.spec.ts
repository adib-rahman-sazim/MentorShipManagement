import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import { DEFAULT_ROLE_PERMISSION_CODES } from "@/modules/permissions/permissions.catalog.constants";

describe("permissions catalog", () => {
  it("gives superadmin all:manage", () => {
    expect(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SUPERADMIN]).toContain("all:manage:allow");
  });

  it("gives sensei user update and role read", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SENSEI];
    expect(codes).toContain("user:update:allow");
    expect(codes).toContain("role:read:allow");
  });

  it("gives mentor user list/read but not user update", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MENTOR];
    expect(codes).toContain("user:list:allow");
    expect(codes).toContain("user:read:allow");
    expect(codes).not.toContain("user:update:allow");
  });

  it("gives mentee dashboard page view but not the user page", () => {
    const codes = DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MENTEE];
    expect(codes).toContain("dashboard:page_view:allow");
    expect(codes).not.toContain("user:page_view:allow");
  });
});
