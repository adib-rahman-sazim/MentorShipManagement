import { EGoogleSSOPurpose } from "./oauth.enums";

export const GOOGLE_OAUTH_SIGN_IN_PARAMS = {
  scope: ["https://www.googleapis.com/auth/userinfo.email", "profile"].join(" "),
  redirectPath: "/auth/google/callback",
  accessType: "online",
  state: { purpose: EGoogleSSOPurpose.SIGN_IN },
};
