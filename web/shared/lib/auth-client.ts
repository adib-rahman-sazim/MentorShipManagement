import { createAuthClient } from "better-auth/react";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { API_BASE_URL } from "@/shared/constants/env.constants";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL ? API_BASE_URL + "/auth" : undefined,
  basePath: "/auth",
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

export const { signIn, signOut, useSession, getSession } = authClient;
