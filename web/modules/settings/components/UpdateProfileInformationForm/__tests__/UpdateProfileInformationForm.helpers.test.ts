import { describe, expect, it } from "vitest";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_REQUIRED_MESSAGE,
  PROFILE_NAME_TOO_LONG_MESSAGE,
} from "@/modules/settings/components/UpdateProfileInformationForm/UpdateProfileInformationForm.constants";
import {
  getUpdateProfileInformationInitialValues,
  updateProfileInformationValidationSchema,
} from "@/modules/settings/components/UpdateProfileInformationForm/UpdateProfileInformationForm.helpers";

describe("updateProfileInformationValidationSchema", () => {
  it("trims the name", () => {
    expect(updateProfileInformationValidationSchema.parse({ name: "  Ada  " })).toEqual({
      name: "Ada",
    });
  });

  it.each([
    { name: "   ", message: PROFILE_NAME_REQUIRED_MESSAGE },
    { name: "a".repeat(PROFILE_NAME_MAX_LENGTH + 1), message: PROFILE_NAME_TOO_LONG_MESSAGE },
  ])("rejects $message", ({ name, message }) => {
    const result = updateProfileInformationValidationSchema.safeParse({ name });

    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe("getUpdateProfileInformationInitialValues", () => {
  it("falls back to an empty name without a profile", () => {
    expect(getUpdateProfileInformationInitialValues()).toEqual({ name: "" });
  });
});
