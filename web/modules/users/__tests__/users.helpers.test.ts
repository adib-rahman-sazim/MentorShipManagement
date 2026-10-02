import { describe, expect, it } from "vitest";

import { EUserRole } from "@/shared/typedefs";

import { isAssignableUserRole } from "../users.helpers";

describe("isAssignableUserRole", () => {
  it("allows Sensei, Mentor and Mentee but never Superadmin", () => {
    expect(isAssignableUserRole(EUserRole.SENSEI)).toBe(true);
    expect(isAssignableUserRole(EUserRole.MENTOR)).toBe(true);
    expect(isAssignableUserRole(EUserRole.MENTEE)).toBe(true);
    expect(isAssignableUserRole(EUserRole.SUPERADMIN)).toBe(false);
  });
});
