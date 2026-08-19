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
      expect(isSafePostAuthRedirect("/invite/accept?token=abc")).toBe(true);
      expect(isSafePostAuthRedirect("/dashboard")).toBe(true);
    });

    it("rejects absolute and protocol-relative URLs", () => {
      expect(isSafePostAuthRedirect("https://evil.example/phish")).toBe(false);
      expect(isSafePostAuthRedirect("//evil.example/phish")).toBe(false);
      expect(isSafePostAuthRedirect("invite/accept")).toBe(false);
    });
  });

  describe("persistPostAuthRedirect and consumePostAuthRedirect", () => {
    it("persists and consumes a safe redirect once", () => {
      persistPostAuthRedirect("/invite/accept?token=abc");

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBe(
        "/invite/accept?token=abc",
      );
      expect(consumePostAuthRedirect()).toBe("/invite/accept?token=abc");
      expect(consumePostAuthRedirect()).toBeNull();
    });

    it("ignores unsafe redirects", () => {
      persistPostAuthRedirect("//evil.example");

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
      expect(consumePostAuthRedirect()).toBeNull();
    });
  });
});
