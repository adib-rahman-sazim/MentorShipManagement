import type { NestMiddleware } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";

import type { NextFunction, Request, Response } from "express";

import {
  CLOUD_TRACE_CONTEXT_HEADER,
  CLOUD_TRACE_SAMPLED_OPTION,
  REDACTED_QUERY_VALUE,
  REQUEST_COMPLETED_LOG_MESSAGE,
  SENSITIVE_QUERY_PARAM_NAMES,
  SPAN_ID_HEX_LENGTH,
  TRACE_ID_HEX_LENGTH,
  TRACEPARENT_HEADER,
} from "./request-logger.constants";
import type { ITraceContext } from "./request-logger.interfaces";

function isHex(value: string, size: number): boolean {
  return value.length === size && /^[0-9a-f]+$/i.test(value);
}

function parseTraceContext(request: Request): ITraceContext {
  const cloudTraceHeader = request.header(CLOUD_TRACE_CONTEXT_HEADER);
  if (cloudTraceHeader) {
    const [traceAndSpanPart, options] = cloudTraceHeader.split(";");
    const [traceId, spanId] = traceAndSpanPart.split("/");

    if (traceId && isHex(traceId, TRACE_ID_HEX_LENGTH)) {
      return {
        traceId,
        spanId: spanId && isHex(spanId, SPAN_ID_HEX_LENGTH) ? spanId : undefined,
        traceSampled: options === CLOUD_TRACE_SAMPLED_OPTION,
      };
    }
  }

  const traceParent = request.header(TRACEPARENT_HEADER);
  if (!traceParent) {
    return {};
  }

  const parts = traceParent.split("-");
  if (parts.length !== 4) {
    return {};
  }

  const [, traceId, spanId, sampled] = parts;
  if (!traceId || !spanId || !sampled) {
    return {};
  }

  if (!isHex(traceId, TRACE_ID_HEX_LENGTH) || !isHex(spanId, SPAN_ID_HEX_LENGTH)) {
    return {};
  }

  const sampledFlag = Number.parseInt(sampled, 16);

  return {
    traceId,
    spanId,
    traceSampled: Number.isFinite(sampledFlag) ? (sampledFlag & 1) === 1 : undefined,
  };
}

function isSensitiveQueryParam(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return SENSITIVE_QUERY_PARAM_NAMES.some((paramName) => normalizedKey.includes(paramName));
}

function sanitizeQuery(query: Request["query"]): Request["query"] {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      isSensitiveQueryParam(key) ? REDACTED_QUERY_VALUE : value,
    ]),
  );
}

function sanitizeUrl(url: string): string {
  const [path, queryString] = url.split("?");

  if (!queryString) {
    return path;
  }

  const searchParams = new URLSearchParams(queryString);
  searchParams.forEach((_value, key) => {
    if (isSensitiveQueryParam(key)) {
      searchParams.set(key, REDACTED_QUERY_VALUE);
    }
  });

  return `${path}?${searchParams.toString()}`;
}

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger(this.constructor.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const { method, originalUrl: url } = request;
    const userAgent = request.get("user-agent") || "";
    const remoteIp = request.ip;
    const traceContext = parseTraceContext(request);

    response.on("close", () => {
      const { statusCode } = response;
      const contentLengthHeader = response.get("content-length");
      const responseSize = contentLengthHeader
        ? Number.parseInt(contentLengthHeader, 10)
        : undefined;

      const logPayload = {
        message: REQUEST_COMPLETED_LOG_MESSAGE,
        traceId: traceContext.traceId,
        spanId: traceContext.spanId,
        traceSampled: traceContext.traceSampled,
        httpRequest: {
          requestMethod: method.toUpperCase(),
          requestUrl: sanitizeUrl(url),
          status: statusCode,
          userAgent,
          remoteIp,
          responseSize,
          latencyMs: Date.now() - startedAt,
        },
        query: sanitizeQuery(request.query),
      };

      if (statusCode >= 400) {
        this.logger.error(logPayload);
        return;
      }

      this.logger.log(logPayload);
    });

    next();
  }
}
