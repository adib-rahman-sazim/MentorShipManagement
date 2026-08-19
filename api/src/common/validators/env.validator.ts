import { plainToInstance } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsPositive, IsString, validateSync } from "class-validator";

import { EEmailProvider } from "@/common/enums/emails.enums";
import { EBooleanEnv, EStageEnv } from "@/common/enums/environment-variables.enums";

import type { IEnvironmentVariables } from "../interfaces/environment-variables.interfaces";

class EnvironmentVariables implements IEnvironmentVariables {
  @IsString()
  NODE_ENV!: string;

  @IsString()
  @IsIn(Object.values(EStageEnv))
  STAGE_ENV!: EStageEnv;

  @IsNumber()
  @IsPositive()
  BE_PORT!: number;

  @IsNumber()
  @IsPositive()
  BE_WS_PORT!: number;

  @IsString()
  API_BASE_URL!: string;

  @IsString()
  API_HEALTH_URL!: string;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  AWS_S3_REGION!: string;

  @IsString()
  AWS_S3_ENDPOINT!: string;

  @IsString()
  AWS_S3_BUCKET_NAME!: string;

  @IsNumber()
  @IsPositive()
  AWS_S3_PRESIGN_URL_EXPIRY_IN_MINUTES!: number;

  @IsString()
  AWS_S3_BUCKET_URL!: string;

  @IsString()
  @IsOptional()
  DOCUSEAL_API_KEY!: string;

  @IsString()
  @IsIn(Object.values(EEmailProvider))
  EMAIL_PROVIDER!: EEmailProvider;

  @IsOptional()
  @IsString()
  RESEND_API_KEY?: string;

  @IsOptional()
  @IsString()
  MAILHOG_HOST?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  MAILHOG_PORT?: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EBooleanEnv))
  ENABLE_AUDIT_LOGGING: EBooleanEnv = EBooleanEnv.FALSE;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EBooleanEnv))
  ENABLE_BULL_BOARD: EBooleanEnv = EBooleanEnv.FALSE;

  @IsOptional()
  @IsString()
  BULL_BOARD_USERNAME?: string;

  @IsOptional()
  @IsString()
  BULL_BOARD_PASSWORD?: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  WEB_CLIENT_BASE_URL!: string;

  @IsString()
  SEND_FROM_EMAIL!: string;

  @IsOptional()
  @IsString()
  ORGANIZATION_OWNER_EMAIL?: string;

  @IsOptional()
  @IsString()
  ORGANIZATION_OWNER_PASSWORD?: string;

  @IsNumber()
  @IsPositive()
  SESSION_EXPIRES_IN!: number;

  @IsNumber()
  @IsPositive()
  SESSION_UPDATE_AGE!: number;

  @IsOptional()
  @IsString()
  AI_PROVIDER?: string;

  @IsOptional()
  @IsString()
  AI_GATEWAY_API_KEY?: string;

  @IsOptional()
  @IsString()
  AI_API_KEY?: string;

  @IsOptional()
  @IsString()
  AI_DEFAULT_MODEL?: string;

  @IsOptional()
  @IsString()
  GOOGLE_GEN_AI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_VECTOR_STORE_ID?: string;

  @IsString()
  STRIPE_SECRET_KEY!: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET!: string;

  @IsOptional()
  @IsString()
  STRIPE_WEBHOOK_FORWARD_URL?: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  CASL_CACHE_TTL_SECONDS?: number;

  @IsOptional()
  @IsString()
  REDIS_QUEUE_PREFIX?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  QUEUE_RETRY_ATTEMPTS?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  QUEUE_RETRY_DELAY?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  QUEUE_COMPLETED_JOB_RETENTION?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  QUEUE_FAILED_JOB_RETENTION?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  QUEUE_PROCESSOR_CONCURRENCY?: number;

  @IsOptional()
  @IsString()
  POSTHOG_API_KEY?: string;

  @IsOptional()
  @IsString()
  POSTHOG_HOST?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  const providerValidationErrors: string[] = [];

  if (validatedConfig.EMAIL_PROVIDER === EEmailProvider.RESEND && !validatedConfig.RESEND_API_KEY) {
    providerValidationErrors.push(
      "RESEND_API_KEY is required when EMAIL_PROVIDER is set to resend",
    );
  }

  if (errors.length > 0 || providerValidationErrors.length > 0) {
    const validationErrors = [
      ...(errors.length > 0 ? [errors.toString()] : []),
      ...providerValidationErrors,
    ];
    throw new Error(validationErrors.join("\n"));
  }
  return validatedConfig;
}
