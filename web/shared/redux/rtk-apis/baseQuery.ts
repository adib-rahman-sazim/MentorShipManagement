import Router from "next/router";

import {
  BaseQueryApi,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";

import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import { API_BASE_URL } from "@/shared/constants/env.constants";
import { HTTP_STATUS_UNAUTHORIZED } from "@/shared/constants/http.constants";
import { SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";
import { TOAST_MESSAGE_SESSION_EXPIRED } from "@/shared/constants/toastMessages.constants";
import { signOut } from "@/shared/lib/auth-client";

import { AUTH_ERROR_CODE_TOAST_MESSAGES } from "./baseQuery.constants";
import { getSessionTerminatingErrorCode, shouldShowAuthErrorToast } from "./baseQuery.helpers";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");

    const accessToken = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
  },
});

const isUnauthorizedError = (error?: FetchBaseQueryError) =>
  error && error.status === HTTP_STATUS_UNAUTHORIZED;

const baseQueryWithErrorHandling = async (args: string | FetchArgs, api: BaseQueryApi) => {
  const result = await baseQuery(args, api, {});

  if (isUnauthorizedError(result.error) && Router.pathname !== SIGN_IN_ROUTE) {
    const hasAccessToken = Boolean(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY));

    await signOut();

    if (shouldShowAuthErrorToast(hasAccessToken)) {
      toast.error(TOAST_MESSAGE_SESSION_EXPIRED);
    }

    Router.push(SIGN_IN_ROUTE);
  }

  const sessionTerminatingErrorCode = getSessionTerminatingErrorCode(result.error);

  if (sessionTerminatingErrorCode && Router.pathname !== SIGN_IN_ROUTE) {
    const hasAccessToken = Boolean(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY));

    await signOut();

    if (shouldShowAuthErrorToast(hasAccessToken)) {
      toast.error(AUTH_ERROR_CODE_TOAST_MESSAGES[sessionTerminatingErrorCode]);
    }

    Router.push(SIGN_IN_ROUTE);
  }

  return result;
};

export default baseQueryWithErrorHandling;
