import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { EPermissionCode, EPermissionSource } from "@/modules/permissions/permissions.enums";
import {
  assertActorHoldsAllManage,
  assertNoDuplicatePermissionCodes,
  assertTargetIsEditable,
  findDuplicatePermissionCode,
  isAllManageHeld,
  resolvePermissionSource,
} from "@/modules/permissions/user-permission-overrides.helpers";

const ALL_MANAGE = EPermissionCode.CAN_MANAGE_ALL;
const READ_USER = EPermissionCode.CAN_READ_USER;
const DELETE_USER = EPermissionCode.CAN_DELETE_USER;

describe("isAllManageHeld", () => {
  it.each([
    ["role grants it and nothing revokes it", [ALL_MANAGE], [], true],
    ["role grants it but a live revoke exists", [ALL_MANAGE], [ALL_MANAGE], false],
    ["role does not grant it", [READ_USER], [], false],
    ["role does not grant it and a revoke exists", [READ_USER], [ALL_MANAGE], false],
    ["an unrelated revoke does not matter", [ALL_MANAGE], [READ_USER], true],
  ])("returns %s", (_label, roleCodes, revokedCodes, expected) => {
    expect(isAllManageHeld({ roleCodes, revokedCodes })).toBe(expected);
  });
});

describe("resolvePermissionSource", () => {
  const buildInput = (effective: string[], granted: string[], revoked: string[]) => ({
    effectiveCodes: new Set(effective),
    grantedCodes: new Set(granted),
    revokedCodes: new Set(revoked),
  });

  it.each([
    ["REVOKED when a revoke exists", [], [], [READ_USER], EPermissionSource.REVOKED],
    [
      "REVOKED even when a grant also exists",
      [],
      [READ_USER],
      [READ_USER],
      EPermissionSource.REVOKED,
    ],
    [
      "GRANTED when an allow makes it effective",
      [READ_USER],
      [READ_USER],
      [],
      EPermissionSource.GRANTED,
    ],
    ["ROLE when effective without an override", [READ_USER], [], [], EPermissionSource.ROLE],
    ["NONE when not held at all", [], [], [], EPermissionSource.NONE],
  ])("returns %s", (_label, effective, granted, revoked, expected) => {
    expect(resolvePermissionSource(READ_USER, buildInput(effective, granted, revoked))).toBe(
      expected,
    );
  });
});

describe("findDuplicatePermissionCode", () => {
  it("returns the first repeated code", () => {
    expect(findDuplicatePermissionCode([READ_USER, DELETE_USER, READ_USER])).toBe(READ_USER);
  });

  it("returns null when every code is distinct", () => {
    expect(findDuplicatePermissionCode([READ_USER, DELETE_USER])).toBeNull();
  });
});

describe("assertActorHoldsAllManage", () => {
  it("passes when the actor holds all:manage", () => {
    expect(() => assertActorHoldsAllManage(true)).not.toThrow();
  });

  it("throws ForbiddenException when the actor does not", () => {
    expect(() => assertActorHoldsAllManage(false)).toThrow(ForbiddenException);
  });
});

describe("assertTargetIsEditable", () => {
  it("passes for a target that does not hold all:manage", () => {
    expect(() => assertTargetIsEditable(false)).not.toThrow();
  });

  it("throws ForbiddenException for the superadmin", () => {
    expect(() => assertTargetIsEditable(true)).toThrow(ForbiddenException);
  });
});

describe("assertNoDuplicatePermissionCodes", () => {
  it("passes for a distinct list", () => {
    expect(() => assertNoDuplicatePermissionCodes([READ_USER, DELETE_USER])).not.toThrow();
  });

  it("throws BadRequestException for a repeated code", () => {
    expect(() => assertNoDuplicatePermissionCodes([READ_USER, READ_USER])).toThrow(
      BadRequestException,
    );
  });
});
