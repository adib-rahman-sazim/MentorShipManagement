import { type Mock, vi } from "vitest";

import { encodeObjectToBase64 } from "../../utils/base64";
import { GOOGLE_OAUTH_SIGN_IN_PARAMS } from "../oauth.constants";
import { getGoogleOAuthSigninParams } from "../oauth.helpers";

vi.mock("../../utils/base64", () => ({
  encodeObjectToBase64: vi.fn(),
}));

describe("OAuth Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getGoogleOAuthSigninParams", () => {
    it("should return correct params with encoded state", () => {
      const mockState = { custom: "data" };
      const encodedState = "encodedBase64String";

      (encodeObjectToBase64 as Mock).mockReturnValueOnce(encodedState);

      const result = getGoogleOAuthSigninParams(mockState);

      expect(encodeObjectToBase64).toHaveBeenCalledWith({
        ...GOOGLE_OAUTH_SIGN_IN_PARAMS.state,
        ...mockState,
      });

      expect(result).toEqual({
        ...GOOGLE_OAUTH_SIGN_IN_PARAMS,
        state: encodedState,
      });
    });

    it("should return correct params with default state when no state is passed", () => {
      const encodedState = "defaultEncodedState";

      (encodeObjectToBase64 as Mock).mockReturnValueOnce(encodedState);

      const result = getGoogleOAuthSigninParams();

      expect(encodeObjectToBase64).toHaveBeenCalledWith(GOOGLE_OAUTH_SIGN_IN_PARAMS.state);

      expect(result).toEqual({
        ...GOOGLE_OAUTH_SIGN_IN_PARAMS,
        state: encodedState,
      });
    });
  });
});
