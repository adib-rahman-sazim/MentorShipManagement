import { shouldShowAuthErrorToast } from "../../redux/rtk-apis/baseQuery.helpers";

describe("shouldShowAuthErrorToast", () => {
  it("shows toast when an access token is still present", () => {
    expect(shouldShowAuthErrorToast(true)).toBe(true);
  });

  it("hides toast when the access token was already cleared", () => {
    expect(shouldShowAuthErrorToast(false)).toBe(false);
  });
});
