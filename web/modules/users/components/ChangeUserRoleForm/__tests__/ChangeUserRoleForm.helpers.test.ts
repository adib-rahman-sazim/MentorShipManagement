import { describe, expect, it } from "vitest";

import { EUserRole } from "@/shared/typedefs";

import {
  changeUserRoleValidationSchema,
  getChangeUserRoleDefaultValues,
} from "../ChangeUserRoleForm.helpers";

describe("ChangeUserRoleForm.helpers", () => {
  it("rejects promoting to Superadmin", () => {
    expect(changeUserRoleValidationSchema.safeParse({ role: EUserRole.SUPERADMIN }).success).toBe(
      false,
    );
  });

  it("pre-selects the current role, leaving it empty for Superadmin", () => {
    expect(getChangeUserRoleDefaultValues(EUserRole.SENSEI).role).toBe(EUserRole.SENSEI);
    expect(getChangeUserRoleDefaultValues(EUserRole.SUPERADMIN).role).toBeUndefined();
  });
});
