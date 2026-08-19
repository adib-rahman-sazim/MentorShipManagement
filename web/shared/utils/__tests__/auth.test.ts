import { vi } from "vitest";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";

import { getAuthToken } from "../auth";

describe("getAuthToken", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should return the token from localStorage when present", () => {
    const testToken = "test-token-123";
    localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, testToken);
    expect(getAuthToken()).toBe(testToken);
  });

  it("should return an empty string when localStorage has no token", () => {
    expect(getAuthToken()).toBe("");
  });

  it("should return an empty string in SSR when window is undefined", () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(getAuthToken()).toBe("");

    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });
});
