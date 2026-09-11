import type { NextRouter } from "next/router";

import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } from "@/shared/constants/http.constants";
import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";
import { TOAST_MESSAGE_ACCOUNT_DEACTIVATED } from "@/shared/constants/toastMessages.constants";
import { POST_AUTH_REDIRECT_STORAGE_KEY } from "@/shared/utils/postAuthRedirect";

import {
  SIGN_IN_EMAIL_INVALID_MESSAGE,
  SIGN_IN_PASSWORD_TOO_SHORT_MESSAGE,
  TOAST_MESSAGE_INVALID_CREDENTIALS,
  TOAST_MESSAGE_UNEXPECTED_ERROR,
} from "../SignInForm.constants";
import { useSignInForm } from "../SignInForm.hooks";

const { mockRouterReplace, mockRouterState, mockSignInEmail, mockToastError } = vi.hoisted(() => {
  const routerState: { query: NextRouter["query"] } = { query: {} };

  return {
    mockRouterReplace: vi.fn(),
    mockRouterState: routerState,
    mockSignInEmail: vi.fn(),
    mockToastError: vi.fn(),
  };
});

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: mockRouterState.query,
    replace: mockRouterReplace,
  }),
}));

vi.mock("@/shared/lib/auth-client", () => ({
  signIn: { email: mockSignInEmail },
}));

vi.mock("sonner", () => ({
  toast: { error: mockToastError },
}));

const VALID_EMAIL = "user@sazim.io";
const VALID_PASSWORD = "correct-horse";
const INVALID_EMAIL = "not-an-email";
const TOO_SHORT_PASSWORD = "short";

const SAFE_REDIRECT = "/dashboard/customers";
const PROTOCOL_RELATIVE_REDIRECT = "//evil.example.com";
const ABSOLUTE_REDIRECT = "https://evil.example.com";

const REDIRECT_QUERY_KEY = "redirect";
const DEACTIVATED_ERROR_MESSAGE = "Your account was disabled by an administrator.";
const UNEXPECTED_ERROR_STATUS = 500;

const SUCCESS_RESULT = { data: { token: "token" }, error: null };

async function renderAndSubmit(email = VALID_EMAIL, password = VALID_PASSWORD) {
  const { result } = renderHook(() => useSignInForm());

  await act(async () => {
    result.current.form.setValue("email", email);
    result.current.form.setValue("password", password);
  });

  await act(async () => {
    await result.current.onSubmit();
  });

  return result;
}

describe("useSignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.query = {};
    window.sessionStorage.clear();
  });

  describe("initial state", () => {
    it("should expose the form and a submit handler", () => {
      const { result } = renderHook(() => useSignInForm());

      expect(result.current.form).toBeDefined();
      expect(result.current.onSubmit).toBeInstanceOf(Function);
    });

    it("should start with empty field values", () => {
      const { result } = renderHook(() => useSignInForm());

      expect(result.current.form.getValues()).toEqual({ email: "", password: "" });
    });
  });

  describe("validation", () => {
    it("should not call signIn when the email is invalid", async () => {
      const result = await renderAndSubmit(INVALID_EMAIL);

      expect(mockSignInEmail).not.toHaveBeenCalled();
      expect(result.current.form.getFieldState("email").error?.message).toBe(
        SIGN_IN_EMAIL_INVALID_MESSAGE,
      );
    });

    it("should not call signIn when the password is too short", async () => {
      const result = await renderAndSubmit(VALID_EMAIL, TOO_SHORT_PASSWORD);

      expect(mockSignInEmail).not.toHaveBeenCalled();
      expect(result.current.form.getFieldState("password").error?.message).toBe(
        SIGN_IN_PASSWORD_TOO_SHORT_MESSAGE,
      );
    });
  });

  describe("success", () => {
    beforeEach(() => {
      mockSignInEmail.mockResolvedValue(SUCCESS_RESULT);
    });

    it("should sign in with the submitted credentials", async () => {
      await renderAndSubmit();

      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });
    });

    it("should not show an error toast", async () => {
      await renderAndSubmit();

      expect(mockToastError).not.toHaveBeenCalled();
    });

    it("should redirect to the dashboard when no redirect is requested", async () => {
      await renderAndSubmit();

      expect(mockRouterReplace).toHaveBeenCalledWith(DASHBOARD_ROUTE);
      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
    });
  });

  describe("redirect handling", () => {
    beforeEach(() => {
      mockSignInEmail.mockResolvedValue(SUCCESS_RESULT);
    });

    it("should redirect to a safe redirect from the query and persist it", async () => {
      mockRouterState.query = { [REDIRECT_QUERY_KEY]: SAFE_REDIRECT };

      await renderAndSubmit();

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBe(SAFE_REDIRECT);
      expect(mockRouterReplace).toHaveBeenCalledWith(SAFE_REDIRECT);
    });

    it("should ignore a protocol-relative redirect", async () => {
      mockRouterState.query = { [REDIRECT_QUERY_KEY]: PROTOCOL_RELATIVE_REDIRECT };

      await renderAndSubmit();

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
      expect(mockRouterReplace).toHaveBeenCalledWith(DASHBOARD_ROUTE);
    });

    it("should ignore an absolute redirect to another origin", async () => {
      mockRouterState.query = { [REDIRECT_QUERY_KEY]: ABSOLUTE_REDIRECT };

      await renderAndSubmit();

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
      expect(mockRouterReplace).toHaveBeenCalledWith(DASHBOARD_ROUTE);
    });

    it("should ignore a repeated redirect query parameter", async () => {
      mockRouterState.query = { [REDIRECT_QUERY_KEY]: [SAFE_REDIRECT, ABSOLUTE_REDIRECT] };

      await renderAndSubmit();

      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
      expect(mockRouterReplace).toHaveBeenCalledWith(DASHBOARD_ROUTE);
    });
  });

  describe("error", () => {
    it("should show the invalid credentials message on 401", async () => {
      mockSignInEmail.mockResolvedValue({ error: { status: HTTP_STATUS_UNAUTHORIZED } });

      await renderAndSubmit();

      expect(mockToastError).toHaveBeenCalledWith(TOAST_MESSAGE_INVALID_CREDENTIALS);
    });

    it("should show the server message on 403", async () => {
      mockSignInEmail.mockResolvedValue({
        error: { status: HTTP_STATUS_FORBIDDEN, message: DEACTIVATED_ERROR_MESSAGE },
      });

      await renderAndSubmit();

      expect(mockToastError).toHaveBeenCalledWith(DEACTIVATED_ERROR_MESSAGE);
    });

    it("should fall back to the deactivated message on 403 without a message", async () => {
      mockSignInEmail.mockResolvedValue({ error: { status: HTTP_STATUS_FORBIDDEN } });

      await renderAndSubmit();

      expect(mockToastError).toHaveBeenCalledWith(TOAST_MESSAGE_ACCOUNT_DEACTIVATED);
    });

    it("should show the unexpected error message for any other status", async () => {
      mockSignInEmail.mockResolvedValue({ error: { status: UNEXPECTED_ERROR_STATUS } });

      await renderAndSubmit();

      expect(mockToastError).toHaveBeenCalledWith(TOAST_MESSAGE_UNEXPECTED_ERROR);
    });

    it("should not redirect or persist a redirect when sign in fails", async () => {
      mockRouterState.query = { [REDIRECT_QUERY_KEY]: SAFE_REDIRECT };
      mockSignInEmail.mockResolvedValue({ error: { status: HTTP_STATUS_UNAUTHORIZED } });

      await renderAndSubmit();

      expect(mockRouterReplace).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
    });
  });
});
