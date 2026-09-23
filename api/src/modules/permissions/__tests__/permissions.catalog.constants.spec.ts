import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import { EPermissionCode, EPermissionConditionType } from "@/modules/permissions/permissions.enums";

const SUPERADMIN_CODES = ["can_manage_all"];

const SENSEI_CODES = [
  "can_view_dashboard",
  "can_view_settings",
  "can_view_mentorship_graph",
  "can_assign_mentor",
  "can_create_draft",
  "can_review_draft",
  "can_approve_draft",
  "can_list_users",
  "can_read_user",
];

const MENTOR_CODES = [
  "can_view_dashboard",
  "can_view_settings",
  "can_view_mentorship_graph",
  "can_read_user",
];

const MENTEE_CODES = [
  "can_view_dashboard",
  "can_view_settings",
  "can_view_mentorship_graph",
  "can_read_user",
];

const SUBTREE_SCOPED_CODES = ["can_update_user", "can_delete_user"];

const HIERARCHY_SCOPED_CODES = ["can_read_user"];

const USER_MANAGEMENT_CODES = [
  "can_create_user",
  "can_update_user",
  "can_delete_user",
  "can_list_roles",
  "can_read_role",
  "can_list_permissions",
  "can_read_permission",
];

const ROLES_WITHOUT_USER_MANAGEMENT = [EUserRole.SENSEI, EUserRole.MENTOR];

const CAN_XYZ_CODE_PATTERN = /^can(_[a-z0-9]+)+$/;

const sorted = (codes: string[]): string[] => [...codes].sort();

describe("permissions catalog", () => {
  it("grants superadmin the manage-all wildcard and nothing else", () => {
    expect(sorted(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SUPERADMIN])).toEqual(
      sorted(SUPERADMIN_CODES),
    );
  });

  it("grants sensei the mms domain attributes and no user management", () => {
    expect(sorted(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SENSEI])).toEqual(sorted(SENSEI_CODES));
  });

  it("lets a mentor read their own people", () => {
    expect(sorted(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MENTOR])).toEqual(sorted(MENTOR_CODES));
  });

  it("leaves mentee able to read their own mentor", () => {
    expect(sorted(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MENTEE])).toEqual(sorted(MENTEE_CODES));
  });

  it.each(ROLES_WITHOUT_USER_MANAGEMENT)("gives %s no user management codes", (role) => {
    const offending = DEFAULT_ROLE_PERMISSION_CODES[role].filter((code) =>
      USER_MANAGEMENT_CODES.includes(code),
    );

    expect(offending).toEqual([]);
  });

  it("defines every code granted to a role", () => {
    const definedCodes = new Set(DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code));
    const grantedCodes = new Set(Object.values(DEFAULT_ROLE_PERMISSION_CODES).flat());
    const undefinedCodes = [...grantedCodes].filter((code) => !definedCodes.has(code));

    expect(undefinedCodes).toEqual([]);
  });

  it("defines each permission code exactly once", () => {
    const codes = DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code);

    expect(codes).toHaveLength(new Set(codes).size);
  });

  it("names every code in the can_xyz format from the requirements", () => {
    const malformedCodes = DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code).filter(
      (code) => !CAN_XYZ_CODE_PATTERN.test(code),
    );

    expect(malformedCodes).toEqual([]);
  });

  it("defines a permission for every declared code", () => {
    const definedCodes = DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code);

    expect(sorted(definedCodes)).toEqual(sorted(Object.values(EPermissionCode)));
  });

  it("scopes user writes to the actor's subtree", () => {
    const scoped = DEFAULT_PERMISSION_DEFINITIONS.filter(
      ({ conditionType }) => conditionType === EPermissionConditionType.SUBTREE,
    ).map(({ code }) => code);

    expect(sorted(scoped)).toEqual(sorted(SUBTREE_SCOPED_CODES));
  });

  it("scopes reads to the actor's part of the hierarchy, both directions", () => {
    const scoped = DEFAULT_PERMISSION_DEFINITIONS.filter(
      ({ conditionType }) => conditionType === EPermissionConditionType.HIERARCHY,
    ).map(({ code }) => code);

    expect(sorted(scoped)).toEqual(sorted(HIERARCHY_SCOPED_CODES));
  });

  it("pairs each code with a distinct resource and action", () => {
    const pairs = DEFAULT_PERMISSION_DEFINITIONS.map(
      ({ resource, action }) => `${resource}|${action}`,
    );

    expect(pairs).toHaveLength(new Set(pairs).size);
  });
});
