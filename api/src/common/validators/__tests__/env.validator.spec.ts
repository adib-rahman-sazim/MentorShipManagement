import "reflect-metadata";

import { EStageEnv } from "@/common/enums/environment-variables.enums";

import { validate } from "../env.validator";

const validEnvironment = {
  NODE_ENV: "production",
  STAGE_ENV: EStageEnv.PRODUCTION,
  BE_PORT: "3000",
  BE_WS_PORT: "3001",
  API_BASE_URL: "https://api.example.com",
  API_HEALTH_URL: "https://api.example.com/api/health",
  DATABASE_URL: "postgresql://user:password@db:5432/mms",
  BETTER_AUTH_SECRET: "test-secret",
  WEB_CLIENT_BASE_URL: "https://app.example.com",
  SESSION_EXPIRES_IN: "604800",
  SESSION_UPDATE_AGE: "86400",
  SUPERADMIN_EMAIL: "initial.admin@example.com",
  SUPERADMIN_PASSWORD: "strong-password",
};

describe("environment validation", () => {
  it("accepts production bootstrap credentials", () => {
    expect(() => validate(validEnvironment)).not.toThrow();
  });

  it("requires bootstrap credentials in production", () => {
    const environment = { ...validEnvironment };
    delete (environment as Partial<typeof environment>).SUPERADMIN_EMAIL;
    delete (environment as Partial<typeof environment>).SUPERADMIN_PASSWORD;

    expect(() => validate(environment)).toThrow();
  });

  it("requires bootstrap credentials to be configured together", () => {
    const environment = {
      ...validEnvironment,
      STAGE_ENV: EStageEnv.DEVELOPMENT,
    };
    delete (environment as Partial<typeof environment>).SUPERADMIN_PASSWORD;

    expect(() => validate(environment)).toThrow();
  });
});
