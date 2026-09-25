import { describe, expect, it } from "vitest";

import {
  buildPermissionOverrides,
  getVisiblePermissions,
} from "@/modules/users/permissions/permissions.helpers";
import { EPermissionOverrideEffect } from "@/shared/typedefs";

import { ADDED, FROM_ROLE, MANAGE_ALL, NOT_HELD, REMOVED } from "./permissions.fixtures";

describe("getVisiblePermissions", () => {
  it("hides the all:manage row", () => {
    expect(getVisiblePermissions([MANAGE_ALL, FROM_ROLE])).toEqual([FROM_ROLE]);
  });
});

describe("buildPermissionOverrides", () => {
  it("keeps the existing overrides when nothing was touched", () => {
    expect(buildPermissionOverrides([FROM_ROLE, NOT_HELD, ADDED, REMOVED], {})).toEqual([
      { permissionCode: ADDED.code, effect: EPermissionOverrideEffect.ALLOW },
      { permissionCode: REMOVED.code, effect: EPermissionOverrideEffect.REVOKE },
    ]);
  });

  it("revokes a role permission that is switched off", () => {
    expect(buildPermissionOverrides([FROM_ROLE], { [FROM_ROLE.code]: false })).toEqual([
      { permissionCode: FROM_ROLE.code, effect: EPermissionOverrideEffect.REVOKE },
    ]);
  });

  it("grants a permission the role lacks when it is switched on", () => {
    expect(buildPermissionOverrides([NOT_HELD], { [NOT_HELD.code]: true })).toEqual([
      { permissionCode: NOT_HELD.code, effect: EPermissionOverrideEffect.ALLOW },
    ]);
  });

  it("drops the override when a permission is switched back to its role default", () => {
    expect(buildPermissionOverrides([REMOVED], { [REMOVED.code]: true })).toEqual([]);
  });
});
