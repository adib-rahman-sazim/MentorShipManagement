import { describe, expect, it } from "vitest";

import {
  buildCreateUserPayload,
  createUserFormValidationSchema,
} from "@/modules/users/components/CreateUserDialog/CreateUserDialog.helpers";
import { ROLE_NOT_ASSIGNABLE_MESSAGE } from "@/modules/users/users.constants";
import { EUserRole, EUserState } from "@/shared/typedefs";

const VALID_VALUES = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  password: "correct-horse",
  role: EUserRole.MENTOR,
  state: EUserState.ACTIVE,
};

describe("createUserFormValidationSchema", () => {
  it("accepts valid values", () => {
    expect(createUserFormValidationSchema.safeParse(VALID_VALUES).success).toBe(true);
  });

  it("rejects the Superadmin role", () => {
    const result = createUserFormValidationSchema.safeParse({
      ...VALID_VALUES,
      role: EUserRole.SUPERADMIN,
    });

    expect(result.error?.issues[0]?.message).toBe(ROLE_NOT_ASSIGNABLE_MESSAGE);
  });
});

describe("buildCreateUserPayload", () => {
  it("copies every form field into the request body", () => {
    expect(buildCreateUserPayload(VALID_VALUES)).toEqual(VALID_VALUES);
  });
});
