import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import {
  isOrganizationBoundRole,
  isSystemLevelRole,
  normalizeRolesByPriority,
  resolveEffectiveRole,
} from "@/modules/permissions/permissions.role-priority.helpers";

describe("permissions.role-priority.helpers", () => {
  it("identifies system and org-bound roles", () => {
    expect(isSystemLevelRole(EUserRole.SUPER_ADMIN)).toBe(true);
    expect(isSystemLevelRole(EUserRole.MANAGER)).toBe(true);
    expect(isSystemLevelRole(EUserRole.CUSTOMER)).toBe(false);
    expect(isOrganizationBoundRole(EUserRole.CUSTOMER)).toBe(true);
    expect(isOrganizationBoundRole(EUserRole.SUPER_ADMIN)).toBe(false);
  });

  it("unions and sorts roles by priority", () => {
    expect(
      normalizeRolesByPriority([EUserRole.CUSTOMER, EUserRole.SUPER_ADMIN, EUserRole.MANAGER]),
    ).toEqual([EUserRole.SUPER_ADMIN, EUserRole.MANAGER, EUserRole.CUSTOMER]);
  });

  it("resolves effective role as highest priority", () => {
    expect(resolveEffectiveRole([EUserRole.CUSTOMER, EUserRole.MANAGER])).toBe(EUserRole.MANAGER);
    expect(resolveEffectiveRole([])).toBeNull();
  });
});
