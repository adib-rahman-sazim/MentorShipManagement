export enum EBackoffType {
  EXPONENTIAL = "exponential",
  FIXED = "fixed",
}

export enum EQueueName {
  AUDIT_LOGS = "audit-logs",
  EXAMPLE_JOBS = "example-jobs",
}

export enum EJobName {
  PROCESS_AUDIT_LOG = "process-audit-log",
  PROCESS_EXAMPLE_JOB = "process-example-job",
}
