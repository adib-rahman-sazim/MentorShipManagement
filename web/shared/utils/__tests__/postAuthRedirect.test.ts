import {
  consumePostAuthRedirect,
  persistPostAuthRedirect,
} from "../postAuthRedirect/postAuthRedirect";
import { POST_AUTH_REDIRECT_STORAGE_KEY } from "../postAuthRedirect/postAuthRedirect.constants";
import { isSafePostAuthRedirect } from "../postAuthRedirect/postAuthRedirect.helpers";

describe("postAuthRedirect", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  describe("isSafePostAuthRedirect", () => {
    it("allows relative app paths", () => {
      expect(isSafePostAuthRedirect("/users?page=2")).toBe(true);
      expect(isSafePostAuthRedirect("/dashboard")).toBe(true);
    });

    it("rejects absolute and protocol-relative URLs", () => {
      expect(isSafePostAuthRedirect("https://evil.example/phish")).toBe(false);
      expect(isSafePostAuthRedirect("//evil.example/phish")).toBe(false);
      expect(isSafePostAuthRedirect("users")).toBe(false);
    });
  });

  describe("persistPostAuthRedirect and consumePostAuthRedirect", () => {
    it("persists and consumes a safe redirect once", () => {
      persistPostAuthRedirect("/users?page=2");

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBe("/users?page=2");
      expect(consumePostAuthRedirect()).toBe("/users?page=2");
      expect(consumePostAuthRedirect()).toBeNull();
    });

    it("ignores unsafe redirects", () => {
      persistPostAuthRedirect("//evil.example");

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
      expect(consumePostAuthRedirect()).toBeNull();
    });
  });
});
