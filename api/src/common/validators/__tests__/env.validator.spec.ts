import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { EEmailProvider } from "@/common/enums/emails.enums";
import { EStageEnv } from "@/common/enums/environment-variables.enums";
import { validate } from "@/common/validators/env.validator";

function buildValidConfig(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    NODE_ENV: "test",
    STAGE_ENV: EStageEnv.TEST,
    BE_PORT: 5000,
    BE_WS_PORT: 5001,
    API_BASE_URL: "http://localhost:5000",
    API_HEALTH_URL: "http://localhost:5000/api/health",
    DATABASE_URL: "postgresql://postgres:postgres@localhost:5443/project_test_db?schema=public",
    AWS_S3_REGION: "us-east-1",
    AWS_S3_ENDPOINT: "http://localhost:4566",
    AWS_S3_BUCKET_NAME: "project-test-bucket",
    AWS_S3_PRESIGN_URL_EXPIRY_IN_MINUTES: 5,
    AWS_S3_BUCKET_URL: "http://localhost:4566",
    EMAIL_PROVIDER: EEmailProvider.MAILHOG,
    SEND_FROM_EMAIL: "noreply@example.com",
    GOOGLE_CLIENT_ID: "client-id",
    GOOGLE_CLIENT_SECRET: "client-secret",
    WEB_CLIENT_BASE_URL: "http://localhost:3000",
    SESSION_EXPIRES_IN: 604800,
    SESSION_UPDATE_AGE: 86400,
    STRIPE_SECRET_KEY: "sk_test_",
    STRIPE_WEBHOOK_SECRET: "whsec_",
    ...overrides,
  };
}

describe("env.validator", () => {
  it("fails when EMAIL_PROVIDER is missing", () => {
    const config = buildValidConfig();
    delete config.EMAIL_PROVIDER;

    expect(() => validate(config)).toThrow();
  });

  it("fails when EMAIL_PROVIDER is not one of allowed values", () => {
    const config = buildValidConfig({
      EMAIL_PROVIDER: "ses",
    });

    expect(() => validate(config)).toThrow();
  });

  it("fails when EMAIL_PROVIDER=resend and RESEND_API_KEY is missing", () => {
    const config = buildValidConfig({
      EMAIL_PROVIDER: EEmailProvider.RESEND,
      RESEND_API_KEY: "",
    });

    expect(() => validate(config)).toThrow(
      /RESEND_API_KEY is required when EMAIL_PROVIDER is set to resend/,
    );
  });

  it("passes for EMAIL_PROVIDER=mailhog without provider API keys", () => {
    const config = buildValidConfig({
      EMAIL_PROVIDER: EEmailProvider.MAILHOG,
      RESEND_API_KEY: undefined,
    });

    expect(() => validate(config)).not.toThrow();
  });

  it("passes when EMAIL_PROVIDER=resend with RESEND_API_KEY", () => {
    const config = buildValidConfig({
      EMAIL_PROVIDER: EEmailProvider.RESEND,
      RESEND_API_KEY: "re_test_key",
    });

    expect(() => validate(config)).not.toThrow();
  });
});
