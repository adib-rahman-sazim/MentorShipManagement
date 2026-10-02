import { ConflictException, ForbiddenException } from "@nestjs/common";

import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";

import { USER_ERROR_MESSAGES } from "../users.constants";
import {
  assertActorCanAssignRole,
  assertNoExistingSuperadmin,
  assertSuperadminNotDemoted,
} from "../users-role-assignment.helpers";

const EXISTING_SUPERADMIN_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_USER_ID = "22222222-2222-4222-8222-222222222222";
const NON_SUPERADMIN_ROLES = [EUserRole.SENSEI, EUserRole.MENTOR, EUserRole.MENTEE];

describe("assertActorCanAssignRole", () => {
  it("refuses a non-superadmin assigning the superadmin role", () => {
    expect(() => assertActorCanAssignRole(EUserRole.SENSEI, EUserRole.SUPERADMIN)).toThrow(
      new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_ASSIGN_SUPERADMIN),
    );
  });

  it("allows a superadmin assigning the superadmin role", () => {
    expect(() =>
      assertActorCanAssignRole(EUserRole.SUPERADMIN, EUserRole.SUPERADMIN),
    ).not.toThrow();
  });

  it("allows any actor assigning a non-superadmin role", () => {
    expect(() => assertActorCanAssignRole(EUserRole.SENSEI, EUserRole.MENTOR)).not.toThrow();
  });
});

describe("assertNoExistingSuperadmin", () => {
  it.each(
    NON_SUPERADMIN_ROLES,
  )("ignores a %s target even when a superadmin already exists", (targetRole) => {
    expect(() =>
      assertNoExistingSuperadmin(targetRole, EXISTING_SUPERADMIN_ID, OTHER_USER_ID),
    ).not.toThrow();
  });

  it("allows the superadmin role when no superadmin exists", () => {
    expect(() => assertNoExistingSuperadmin(EUserRole.SUPERADMIN, null)).not.toThrow();
  });

  it("refuses promoting another user while a superadmin exists", () => {
    expect(() =>
      assertNoExistingSuperadmin(EUserRole.SUPERADMIN, EXISTING_SUPERADMIN_ID, OTHER_USER_ID),
    ).toThrow(new ConflictException(USER_ERROR_MESSAGES.SUPERADMIN_ALREADY_EXISTS));
  });

  it("refuses creating a superadmin while one exists", () => {
    expect(() => assertNoExistingSuperadmin(EUserRole.SUPERADMIN, EXISTING_SUPERADMIN_ID)).toThrow(
      new ConflictException(USER_ERROR_MESSAGES.SUPERADMIN_ALREADY_EXISTS),
    );
  });

  it("allows the existing superadmin to keep their own role", () => {
    expect(() =>
      assertNoExistingSuperadmin(
        EUserRole.SUPERADMIN,
        EXISTING_SUPERADMIN_ID,
        EXISTING_SUPERADMIN_ID,
      ),
    ).not.toThrow();
  });
});

describe("assertSuperadminNotDemoted", () => {
  it.each(NON_SUPERADMIN_ROLES)("refuses demoting the superadmin to %s", (targetRole) => {
    expect(() => assertSuperadminNotDemoted(EUserRole.SUPERADMIN, targetRole)).toThrow(
      new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_DEMOTE_SUPERADMIN),
    );
  });

  it("allows the superadmin to keep the superadmin role", () => {
    expect(() =>
      assertSuperadminNotDemoted(EUserRole.SUPERADMIN, EUserRole.SUPERADMIN),
    ).not.toThrow();
  });

  it("allows changing the role of a non-superadmin", () => {
    expect(() => assertSuperadminNotDemoted(EUserRole.MENTEE, EUserRole.MENTOR)).not.toThrow();
  });
});
