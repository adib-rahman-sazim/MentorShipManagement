import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException, Logger } from "@nestjs/common";

import type { Response } from "express";

import { getErrorCode } from "./custom-base-exception.filter.helpers";

@Catch(HttpException)
export class CustomBaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const cause = exception.cause ?? [];
    const errorCode = getErrorCode(exception);

    this.logger.error(exception.message, exception.stack, {
      statusCode: status,
      message: exception.message,
      cause,
      response: exception.getResponse(),
    });

    if (Array.isArray(cause)) {
      return response.status(status).json({
        statusCode: status,
        errors: cause,
        message: exception.message,
        errorCode,
      });
    }

    return response.status(status).json({
      statusCode: status,
      errors: [exception.cause],
      message: exception.message,
      errorCode,
    });
  }
}
