import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { API_BASE_URL } from "@/shared/constants/env.constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL ? API_BASE_URL + "/auth" : undefined,
  basePath: "/auth",
  plugins: [organizationClient()],
  fetchOptions: {
    credentials: "omit",
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY) || "",
    },
    onResponse: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, authToken);
      }
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifyEmail,
} = authClient;
