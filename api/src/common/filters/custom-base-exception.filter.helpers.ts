import type { HttpException } from "@nestjs/common";

import type { IErrorCodeBody } from "./custom-base-exception.filter.interfaces";

function hasErrorCode(body: unknown): body is IErrorCodeBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "errorCode" in body &&
    typeof body.errorCode === "string"
  );
}

export function getErrorCode(exception: HttpException): string | undefined {
  const body = exception.getResponse();

  return hasErrorCode(body) ? body.errorCode : undefined;
}
