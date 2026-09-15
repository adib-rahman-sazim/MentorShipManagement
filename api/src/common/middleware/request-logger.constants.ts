export const REQUEST_COMPLETED_LOG_MESSAGE = "http.request.completed";
export const TRACE_ID_HEX_LENGTH = 32;
export const SPAN_ID_HEX_LENGTH = 16;
export const REDACTED_QUERY_VALUE = "[REDACTED]";
export const CLOUD_TRACE_CONTEXT_HEADER = "x-cloud-trace-context";
export const TRACEPARENT_HEADER = "traceparent";
export const CLOUD_TRACE_SAMPLED_OPTION = "o=1";
export const SENSITIVE_QUERY_PARAM_NAMES = [
  "access_token",
  "code",
  "password",
  "refresh_token",
  "secret",
  "signature",
  "token",
] as const;
