import type { EBooleanEnv, EStageEnv } from "@/common/enums/environment-variables.enums";

export interface IEnvironmentVariables {
  NODE_ENV: string;
  STAGE_ENV: EStageEnv;
  BE_PORT: number;
  BE_WS_PORT: number;
  API_BASE_URL: string;
  API_HEALTH_URL: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  WEB_CLIENT_BASE_URL: string;
  SESSION_EXPIRES_IN: number;
  SESSION_UPDATE_AGE: number;
  ENABLE_AUDIT_LOGGING?: EBooleanEnv;
  SUPERADMIN_EMAIL?: string;
  SUPERADMIN_PASSWORD?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: number;
  REDIS_PASSWORD?: string;
  CASL_CACHE_TTL_SECONDS?: number;
  REDIS_QUEUE_PREFIX?: string;
  QUEUE_RETRY_ATTEMPTS?: number;
  QUEUE_RETRY_DELAY?: number;
  QUEUE_COMPLETED_JOB_RETENTION?: number;
  QUEUE_FAILED_JOB_RETENTION?: number;
  QUEUE_PROCESSOR_CONCURRENCY?: number;
  ENABLE_BULL_BOARD?: EBooleanEnv;
  BULL_BOARD_USERNAME?: string;
  BULL_BOARD_PASSWORD?: string;
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
}
