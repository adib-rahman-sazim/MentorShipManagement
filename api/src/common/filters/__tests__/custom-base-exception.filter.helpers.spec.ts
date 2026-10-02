import { ForbiddenException } from "@nestjs/common";

import { describe, expect, it } from "vitest";

import { EAuthErrorCode } from "@/modules/auth/auth.enums";

import { getErrorCode } from "../custom-base-exception.filter.helpers";

describe("getErrorCode", () => {
  it("returns the error code from an object body", () => {
    const exception = new ForbiddenException({
      message: "Forbidden",
      errorCode: EAuthErrorCode.ACCOUNT_DEACTIVATED,
    });

    expect(getErrorCode(exception)).toBe(EAuthErrorCode.ACCOUNT_DEACTIVATED);
  });

  it.each([
    ["a string body", new ForbiddenException("Forbidden")],
    ["an object body without an error code", new ForbiddenException({ message: "Forbidden" })],
    ["a non-string error code", new ForbiddenException({ message: "Forbidden", errorCode: 403 })],
  ])("returns undefined for %s", (_, exception) => {
    expect(getErrorCode(exception)).toBeUndefined();
  });
});
