import { EBackoffType, EJobName, EQueueName } from "./queue.enums";

export const QUEUE_BACKOFF_TYPE_EXPONENTIAL = EBackoffType.EXPONENTIAL;
export const QUEUE_BACKOFF_TYPE_FIXED = EBackoffType.FIXED;

export const DEFAULT_QUEUE_RETRY_ATTEMPTS = "3";
export const DEFAULT_QUEUE_RETRY_DELAY_MS = "1000";
export const DEFAULT_QUEUE_COMPLETED_JOB_RETENTION_S = "3600";
export const DEFAULT_QUEUE_FAILED_JOB_RETENTION_S = "86400";
export const DEFAULT_QUEUE_PROCESSOR_CONCURRENCY = 5;

export const QUEUE_NAMES = EQueueName;
export const JOB_NAMES = EJobName;
