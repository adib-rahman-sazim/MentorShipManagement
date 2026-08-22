export const BETTER_AUTH_BASE_PATH = "/api/v1/auth";

export const AUTH_CORS_ALLOWED_METHODS = "GET, POST, PUT, DELETE, PATCH, OPTIONS";

export const AUTH_CORS_ALLOWED_HEADERS =
  "Content-Type, Authorization, X-Requested-With, Accept, Origin";

export const AUTH_ERROR_MESSAGES = {
  ACCOUNT_DEACTIVATED: "Your account has been deactivated. Please contact an administrator.",
  ACCOUNT_NOT_FOUND: "Your account no longer exists.",
  AUTH_NOT_INITIALIZED: "Auth instance not initialized",
  NO_VALID_SESSION: "No valid session found",
  INVALID_OR_EXPIRED_SESSION: "Invalid or expired session",
  SESSION_MISSING_ROLE: "Session is missing user role",
};