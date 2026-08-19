import { context, trace } from "@opentelemetry/api";
import dayjs from "dayjs";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import * as winston from "winston";
import "winston-daily-rotate-file";

import type { ITraceContext } from "@/common/middleware/request-logger.interfaces";

import {
  GCP_LOGGING_SPAN_ID_FIELD,
  GCP_LOGGING_TRACE_FIELD,
  GCP_LOGGING_TRACE_SAMPLED_FIELD,
  GCP_SEVERITY_DEBUG,
  GCP_SEVERITY_WARNING,
  JSON_LOG_STAGES,
  LOCAL_STAGE,
  MAX_LOG_FILES,
  SERVICE_NAME,
  WINSTON_SEVERITY_VERBOSE,
  WINSTON_SEVERITY_WARN,
} from "./logger.constants";
import type { TLogRecord, TStageEnv } from "./logger.types";

function createLogDirectory(): string {
  const logDir = join(process.cwd(), "logs");
  if (!existsSync(logDir)) {
    mkdirSync(logDir);
  }
  return logDir;
}

function getStageEnv(): TStageEnv {
  return (process.env.STAGE_ENV as TStageEnv | undefined) ?? LOCAL_STAGE;
}

function getGcpProjectId(): string | undefined {
  return process.env.GOOGLE_CLOUD_PROJECT;
}

function isRecord(value: unknown): value is TLogRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeSeverity(level: string): string {
  if (level === WINSTON_SEVERITY_WARN) {
    return GCP_SEVERITY_WARNING;
  }

  if (level === WINSTON_SEVERITY_VERBOSE) {
    return GCP_SEVERITY_DEBUG;
  }

  return level.toUpperCase();
}

function normalizeMessage(message: unknown): string {
  if (typeof message === "string") {
    return message;
  }

  if (isRecord(message) && typeof message.message === "string") {
    return message.message;
  }

  if (!message) {
    return "";
  }

  return JSON.stringify(message);
}

function extractSpanTraceContext(): ITraceContext {
  const spanContext = trace.getSpan(context.active())?.spanContext();

  if (!spanContext) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
    traceSampled: (spanContext.traceFlags & 1) === 1,
  };
}

const enrichStructuredFields = winston.format((rawInfo) => {
  const info = rawInfo as winston.Logform.TransformableInfo & TLogRecord;
  const messageRecord = isRecord(info.message) ? info.message : undefined;
  const contextRecord = isRecord(info.context) ? info.context : undefined;
  const stage = getStageEnv();
  const gcpProjectId = getGcpProjectId();

  info.timestamp =
    typeof info.timestamp === "string" && info.timestamp.length > 0
      ? info.timestamp
      : dayjs().toDate().toISOString();
  info.severity = normalizeSeverity(String(info.level ?? "info"));
  info.message = normalizeMessage(info.message);
  info.service = SERVICE_NAME;
  info.stage = stage;

  if (messageRecord) {
    for (const [key, value] of Object.entries(messageRecord)) {
      if (key !== "message") {
        info[key] = value;
      }
    }
  }

  if (contextRecord) {
    for (const [key, value] of Object.entries(contextRecord)) {
      info[key] = value;
    }
    delete info.context;
  }

  let traceSampled: boolean | undefined;
  if (typeof info.traceSampled === "boolean") {
    traceSampled = info.traceSampled;
  } else if (messageRecord && typeof messageRecord.traceSampled === "boolean") {
    traceSampled = messageRecord.traceSampled;
  }

  const traceContext: ITraceContext = {
    ...extractSpanTraceContext(),
    traceId:
      (typeof info.traceId === "string" && info.traceId) ||
      (messageRecord && typeof messageRecord.traceId === "string"
        ? messageRecord.traceId
        : undefined),
    spanId:
      (typeof info.spanId === "string" && info.spanId) ||
      (messageRecord && typeof messageRecord.spanId === "string"
        ? messageRecord.spanId
        : undefined),
    traceSampled,
  };

  if (traceContext.traceId && gcpProjectId) {
    info[GCP_LOGGING_TRACE_FIELD] = `projects/${gcpProjectId}/traces/${traceContext.traceId}`;
  }

  if (traceContext.spanId) {
    info[GCP_LOGGING_SPAN_ID_FIELD] = traceContext.spanId;
  }

  if (typeof traceContext.traceSampled === "boolean") {
    info[GCP_LOGGING_TRACE_SAMPLED_FIELD] = traceContext.traceSampled;
  }

  return info as winston.Logform.TransformableInfo;
});

function getErrorMessage(error: unknown): string {
  if (!error) {
    return "";
  }

  if (error instanceof Error) {
    return error.stack?.toString() ?? error.message;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return isRecord(error) ? JSON.stringify(error) : String(error);
}

function getFormattedError(error: unknown): string {
  if (!error) {
    return "";
  }

  if (Array.isArray(error)) {
    return error.map((item) => getErrorMessage(item)).join("");
  }

  return getErrorMessage(error);
}

function getReadableFormat() {
  return winston.format.printf((info) => {
    const { timestamp, level, message, context, traceId, stack: error } = info;
    const formattedTraceId = traceId ? `[Trace: ${String(traceId)}]` : "";
    const formattedContext = typeof context === "string" ? `[${context}]` : "";
    const formattedMessage =
      typeof message === "object" ? JSON.stringify(message) : String(message);
    const formattedContextObject = typeof context === "object" ? JSON.stringify(context) : "";
    const formattedError = getFormattedError(error);

    return `${String(timestamp)} [${level}] ${formattedTraceId} ${formattedContext} ${formattedMessage} ${formattedContextObject} ${formattedError}`;
  });
}

function createJsonConsoleTransport(): winston.transport {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: () => dayjs().toDate().toISOString() }),
      winston.format.splat(),
      enrichStructuredFields(),
      winston.format.json(),
    ),
    level: "debug",
    handleExceptions: true,
    stderrLevels: ["error"],
  });
}

function createReadableConsoleTransport(): winston.transport {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: () => dayjs().toDate().toISOString() }),
      winston.format.splat(),
      winston.format.colorize({ all: true }),
      getReadableFormat(),
    ),
    level: "debug",
    handleExceptions: true,
  });
}

function createLocalRotateFileTransports(): winston.transport[] {
  const logDir = createLogDirectory();
  const format = winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: () => dayjs().toDate().toISOString() }),
    winston.format.splat(),
    getReadableFormat(),
  );

  return [
    new winston.transports.DailyRotateFile({
      format,
      level: "debug",
      datePattern: "YYYY-MM-DD",
      dirname: `${logDir}/debug`,
      filename: "%DATE%.log",
      maxFiles: MAX_LOG_FILES,
      json: false,
      zippedArchive: true,
    }),
    new winston.transports.DailyRotateFile({
      format,
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: `${logDir}/error`,
      filename: "%DATE%.log",
      maxFiles: MAX_LOG_FILES,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),
  ];
}

export default function getWinstonLoggerTransports(): winston.transport[] {
  const stage = getStageEnv();

  if (JSON_LOG_STAGES.has(stage)) {
    return [createJsonConsoleTransport()];
  }

  const transports: winston.transport[] = [createReadableConsoleTransport()];

  if (stage === LOCAL_STAGE) {
    transports.unshift(...createLocalRotateFileTransports());
  }

  return transports;
}
