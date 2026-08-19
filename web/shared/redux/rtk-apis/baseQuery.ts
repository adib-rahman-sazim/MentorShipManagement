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
import { SIGN_IN_ROUTE } from "@/shared/constants/routes.constants";
import {
  TOAST_MESSAGE_ACCOUNT_DEACTIVATED,
  TOAST_MESSAGE_SESSION_EXPIRED,
} from "@/shared/constants/toastMessages.constants";
import { signOut } from "@/shared/lib/auth-client";

import { shouldShowAuthErrorToast } from "./baseQuery.helpers";

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

const isUnauthorizedError = (error?: FetchBaseQueryError) => error && error.status === 401;

const isForbiddenError = (error?: FetchBaseQueryError) => error && error.status === 403;

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

  if (isForbiddenError(result.error) && Router.pathname !== SIGN_IN_ROUTE) {
    const hasAccessToken = Boolean(localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY));

    await signOut();

    if (shouldShowAuthErrorToast(hasAccessToken)) {
      toast.error(TOAST_MESSAGE_ACCOUNT_DEACTIVATED);
    }

    Router.push(SIGN_IN_ROUTE);
  }

  return result;
};

export default baseQueryWithErrorHandling;
