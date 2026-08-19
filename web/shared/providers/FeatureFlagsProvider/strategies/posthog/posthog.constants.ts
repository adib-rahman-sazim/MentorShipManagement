export const POSTHOG_INIT_OPTIONS = {
  capture_pageview: false,
  capture_pageleave: true,
  persistence: "localStorage+cookie",
  autocapture: false,
  disable_session_recording: true,
} as const;
