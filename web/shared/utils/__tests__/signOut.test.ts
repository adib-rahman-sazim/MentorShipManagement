import type { NextRouter } from "next/router";

import { vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { SIGN_IN_ROUTE } from "../../constants/routes.constants";
import projectApi from "../../redux/rtk-apis/api.config";
import { ESignOutReason, SIGN_OUT_EVENT_NAME, signOut } from "../signOut";

vi.mock("../../lib/auth-client", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../redux/rtk-apis/api.config", () => ({
  default: {
    util: {
      resetApiState: vi.fn(),
    },
  },
}));

const mockDispatch = vi.fn();
const mockRouter = mockDeep<NextRouter>();

describe("signOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should clear localStorage", async () => {
    localStorage.setItem("test", "value");
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
    });
    expect(localStorage.getItem("test")).toBeNull();
  });

  it("should dispatch resetApiState", async () => {
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
    });
    expect(mockDispatch).toHaveBeenCalledWith(projectApi.util.resetApiState());
  });

  it("should emit sign out event if shouldEmitSignOutEvent is true", async () => {
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
      shouldEmitSignOutEvent: true,
    });
    expect(localStorage.getItem(SIGN_OUT_EVENT_NAME)).toBeNull();
  });

  it("should not emit sign out event if shouldEmitSignOutEvent is false", async () => {
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
      shouldEmitSignOutEvent: false,
    });
    expect(localStorage.getItem(SIGN_OUT_EVENT_NAME)).toBeNull();
  });

  it("should redirect to the specified route", async () => {
    const redirectRoute = "/custom-route";
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
      redirectRoute,
    });
    expect(mockRouter.push).toHaveBeenCalledWith(redirectRoute);
  });

  it("should redirect to SIGN_IN_ROUTE if no redirectRoute is specified", async () => {
    await signOut({
      dispatch: mockDispatch,
      router: mockRouter,
      reason: ESignOutReason.UserSignedOut,
    });
    expect(mockRouter.push).toHaveBeenCalledWith(SIGN_IN_ROUTE);
  });
});
