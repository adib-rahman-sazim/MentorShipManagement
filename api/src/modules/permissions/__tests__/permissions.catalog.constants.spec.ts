import { describe, expect, it } from "vitest";

import { EUserRole } from "@/common/enums/roles.enums";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import { isValidPermissionString } from "@/utils/permission-string/permission-string.helpers";

const SUPERADMIN_CODES = ["all:manage:allow"];

const SENSEI_CODES = [
  "dashboard:page_view:allow",
  "settings:page_view:allow",
  "mentorship_graph:page_view:allow",
  "mentorship:assign:allow",
  "draft:create:allow",
  "draft:review:allow",
  "draft:approve:allow",
  "user:list:allow",
  "user:read:allow",
];

const MENTOR_CODES = [
  "dashboard:page_view:allow",
  "settings:page_view:allow",
  "mentorship_graph:page_view:allow",
];

const MENTEE_CODES = [
  "dashboard:page_view:allow",
  "settings:page_view:allow",
  "mentorship_graph:page_view:allow",
  "user:read:allow",
];

const USER_MANAGEMENT_CODES = [
  "user:create:allow",
  "user:update:allow",
  "user:delete:allow",
  "role:list:allow",
  "role:read:allow",
  "permissions:list:allow",
  "permissions:read:allow",
];

const ROLES_WITHOUT_USER_MANAGEMENT = [EUserRole.SENSEI, EUserRole.MENTOR];

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

  it("grants mentor the graph page only", () => {
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

  it("defines only parseable permission codes", () => {
    const malformedCodes = DEFAULT_PERMISSION_DEFINITIONS.map(({ code }) => code).filter(
      (code) => !isValidPermissionString(code),
    );

    expect(malformedCodes).toEqual([]);
  });
});
