import { EStageEnv } from "@/common/enums/environment-variables.enums";

export const JSON_LOG_STAGES = new Set([EStageEnv.STAGING, EStageEnv.PRODUCTION]);
export const LOCAL_STAGE = EStageEnv.LOCAL;
export const SERVICE_NAME = "project-backend";
export const MAX_LOG_FILES = 7;

export const WINSTON_SEVERITY_WARN = "warn";
export const WINSTON_SEVERITY_VERBOSE = "verbose";
export const GCP_SEVERITY_WARNING = "WARNING";
export const GCP_SEVERITY_DEBUG = "DEBUG";

export const GCP_LOGGING_TRACE_FIELD = "logging.googleapis.com/trace";
export const GCP_LOGGING_SPAN_ID_FIELD = "logging.googleapis.com/spanId";
export const GCP_LOGGING_TRACE_SAMPLED_FIELD = "logging.googleapis.com/trace_sampled";
