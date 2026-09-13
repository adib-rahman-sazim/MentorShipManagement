import { describe, expect, it } from "vitest";

import { resolveEffectivePermissionCodes } from "@/modules/permissions/effective-permissions.helpers";
import { ALL_MANAGE_PERMISSION_CODE } from "@/modules/permissions/permissions.catalog.constants";
import type { IEffectivePermissionCodesInput } from "@/modules/permissions/permissions.interfaces";

const USER_READ = "user:read:allow";
const USER_UPDATE = "user:update:allow";
const USER_DELETE = "user:delete:allow";
const ALL_CODES = [ALL_MANAGE_PERMISSION_CODE, USER_READ, USER_UPDATE, USER_DELETE];

const buildInput = (
  overrides: Partial<IEffectivePermissionCodesInput> = {},
): IEffectivePermissionCodesInput => ({
  roleCodes: [],
  grantedCodes: [],
  revokedCodes: [],
  allCodes: ALL_CODES,
  ...overrides,
});

describe("resolveEffectivePermissionCodes", () => {
  it("returns the role's own permissions when there are no overrides", () => {
    expect(resolveEffectivePermissionCodes(buildInput({ roleCodes: [USER_READ] }))).toEqual([
      USER_READ,
    ]);
  });

  it("adds a permission the role does not have", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_READ], grantedCodes: [USER_UPDATE] }),
      ),
    ).toEqual([USER_READ, USER_UPDATE].sort());
  });

  it("removes a permission the role does have", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_READ, USER_UPDATE], revokedCodes: [USER_UPDATE] }),
      ),
    ).toEqual([USER_READ]);
  });

  it("lets a revoke win over a grant for the same permission", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ grantedCodes: [USER_UPDATE], revokedCodes: [USER_UPDATE] }),
      ),
    ).toEqual([]);
  });

  it("deduplicates a permission held through both the role and a grant", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_READ], grantedCodes: [USER_READ] }),
      ),
    ).toEqual([USER_READ]);
  });

  it("ignores a revoke for a permission nobody holds", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_READ], revokedCodes: [USER_DELETE] }),
      ),
    ).toEqual([USER_READ]);
  });

  it("expands manage-everything into every other permission", () => {
    const codes = resolveEffectivePermissionCodes(
      buildInput({ roleCodes: [ALL_MANAGE_PERMISSION_CODE] }),
    );

    expect(codes).toEqual([USER_DELETE, USER_READ, USER_UPDATE].sort());
    expect(codes).not.toContain(ALL_MANAGE_PERMISSION_CODE);
  });

  it("lets a revoke carve a hole in manage-everything", () => {
    const codes = resolveEffectivePermissionCodes(
      buildInput({ roleCodes: [ALL_MANAGE_PERMISSION_CODE], revokedCodes: [USER_DELETE] }),
    );

    expect(codes).not.toContain(USER_DELETE);
    expect(codes).toContain(USER_READ);
  });

  it("expands manage-everything granted through an override", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_READ], grantedCodes: [ALL_MANAGE_PERMISSION_CODE] }),
      ),
    ).toContain(USER_DELETE);
  });

  it("returns codes in a stable order", () => {
    expect(
      resolveEffectivePermissionCodes(
        buildInput({ roleCodes: [USER_UPDATE, USER_DELETE, USER_READ] }),
      ),
    ).toEqual([USER_DELETE, USER_READ, USER_UPDATE]);
  });
});
