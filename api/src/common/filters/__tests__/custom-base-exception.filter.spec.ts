import type { ArgumentsHost, Logger } from "@nestjs/common";
import { ForbiddenException, HttpStatus } from "@nestjs/common";

import type { Response } from "express";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { AUTH_ERROR_MESSAGES } from "@/modules/auth/auth.constants";
import { EAuthErrorCode } from "@/modules/auth/auth.enums";

import { CustomBaseExceptionFilter } from "../custom-base-exception.filter";

describe("CustomBaseExceptionFilter", () => {
  it("should pass the error code through to the response body", () => {
    const mockResponse = mockDeep<Response>();
    mockResponse.status.mockReturnValue(mockResponse);
    const mockHost = mockDeep<ArgumentsHost>();
    mockHost.switchToHttp.mockReturnValue({
      getResponse: () => mockResponse,
    } as ReturnType<ArgumentsHost["switchToHttp"]>);

    new CustomBaseExceptionFilter(mockDeep<Logger>()).catch(
      new ForbiddenException({
        message: AUTH_ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
        errorCode: EAuthErrorCode.ACCOUNT_DEACTIVATED,
      }),
      mockHost,
    );

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: AUTH_ERROR_MESSAGES.ACCOUNT_DEACTIVATED,
        errorCode: EAuthErrorCode.ACCOUNT_DEACTIVATED,
      }),
    );
  });
});
