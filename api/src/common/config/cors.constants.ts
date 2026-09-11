export const LOCAL_ALLOWED_URLS_WILDCARDS: string[] = ["http://localhost:*"];
export const DEVELOPMENT_ALLOWED_URLS_WILDCARDS: string[] = [];
export const PRODUCTION_ALLOWED_URLS_WILDCARDS: string[] = [];

export const ALLOWED_HEADERS = [
  "host",
  "user-agent",
  "accept",
  "accept-language",
  "accept-encoding",
  "content-type",
  "authorization",
  "content-length",
  "origin",
  "connection",
  "referer",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "pragma",
  "cache-control",
  "access-control-request-headers",
  "access-control-request-method",
];

export const ALLOWED_METHODS = [
  "GET",
  "HEAD",
  "PUT",
  "POST",
  "PATCH",
  "DELETE",
  "OPTIONS",
] as const;

export const EXPOSED_HEADERS = ["set-auth-token"];
