import { encodeObjectToBase64 } from "../utils/base64";
import { GOOGLE_OAUTH_SIGN_IN_PARAMS } from "./oauth.constants";

export const getGoogleOAuthSigninParams = (state?: Record<string, unknown>) => {
  const params = {
    ...GOOGLE_OAUTH_SIGN_IN_PARAMS,
    state: encodeObjectToBase64({
      ...GOOGLE_OAUTH_SIGN_IN_PARAMS.state,
      ...state,
    }),
  };

  return params;
};
