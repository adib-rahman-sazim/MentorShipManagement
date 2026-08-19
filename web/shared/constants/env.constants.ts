import { env } from "next-runtime-env";

export const NODE_ENV = env("NODE_ENV") as "production" | "development" | "local";
export const STAGE_ENV = env("NEXT_PUBLIC_STAGE_ENV") as "production" | "development" | "local";
export const API_BASE_URL = env("NEXT_PUBLIC_API_BASE_URL");
export const WS_BASE_URL = env("NEXT_PUBLIC_WS_BASE_URL");

export const GOOGLE_CLIENT_ID = env("NEXT_PUBLIC_GOOGLE_CLIENT_ID");

export const POSTHOG_KEY = env("NEXT_PUBLIC_POSTHOG_KEY");
export const POSTHOG_HOST = env("NEXT_PUBLIC_POSTHOG_HOST");
