import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import { HTTP_STATUS_FORBIDDEN } from "@/shared/constants/http.constants";
import { EAuthErrorCode, IAuthErrorResponse } from "@/shared/typedefs";

export const shouldShowAuthErrorToast = (hasAccessToken: boolean): boolean => hasAccessToken;

function isAuthErrorCode(value: unknown): value is EAuthErrorCode {
  return Object.values<unknown>(EAuthErrorCode).includes(value);
}

function isAuthErrorResponse(data: unknown): data is IAuthErrorResponse {
  return typeof data === "object" && data !== null && "errorCode" in data;
}

export function getSessionTerminatingErrorCode(error?: FetchBaseQueryError): EAuthErrorCode | null {
  if (error?.status !== HTTP_STATUS_FORBIDDEN || !isAuthErrorResponse(error.data)) {
    return null;
  }

  return isAuthErrorCode(error.data.errorCode) ? error.data.errorCode : null;
}
