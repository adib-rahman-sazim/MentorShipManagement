import { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_UNAUTHORIZED } from "@/shared/constants/http.constants";
import {
  getSessionTerminatingErrorCode,
  shouldShowAuthErrorToast,
} from "@/shared/redux/rtk-apis/baseQuery.helpers";
import { EAuthErrorCode } from "@/shared/typedefs";

const BUSINESS_RULE_MESSAGE = "You cannot deactivate your own account";

describe("shouldShowAuthErrorToast", () => {
  it("shows toast when an access token is still present", () => {
    expect(shouldShowAuthErrorToast(true)).toBe(true);
  });

  it("hides toast when the access token was already cleared", () => {
    expect(shouldShowAuthErrorToast(false)).toBe(false);
  });
});

describe("getSessionTerminatingErrorCode", () => {
  it("returns the code for a session-guard 403", () => {
    const error = {
      status: HTTP_STATUS_FORBIDDEN,
      data: { errorCode: EAuthErrorCode.ACCOUNT_DEACTIVATED },
    };

    expect(getSessionTerminatingErrorCode(error)).toBe(EAuthErrorCode.ACCOUNT_DEACTIVATED);
  });

  it("returns null for a business-rule 403", () => {
    const error = { status: HTTP_STATUS_FORBIDDEN, data: { message: BUSINESS_RULE_MESSAGE } };

    expect(getSessionTerminatingErrorCode(error)).toBeNull();
  });

  it("returns null when the status is not 403", () => {
    const error = {
      status: HTTP_STATUS_UNAUTHORIZED,
      data: { errorCode: EAuthErrorCode.ACCOUNT_DEACTIVATED },
    };

    expect(getSessionTerminatingErrorCode(error)).toBeNull();
  });
});
