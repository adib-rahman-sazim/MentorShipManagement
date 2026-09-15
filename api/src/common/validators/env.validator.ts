import { plainToInstance } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateIf,
  validateSync,
} from "class-validator";

import { EBooleanEnv, EStageEnv } from "@/common/enums/environment-variables.enums";
import { USER_PASSWORD_MIN_LENGTH } from "@/modules/users/users.constants";

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
  BETTER_AUTH_SECRET!: string;

  @IsString()
  WEB_CLIENT_BASE_URL!: string;

  @IsNumber()
  @IsPositive()
  SESSION_EXPIRES_IN!: number;

  @IsNumber()
  @IsPositive()
  SESSION_UPDATE_AGE!: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(EBooleanEnv))
  ENABLE_AUDIT_LOGGING: EBooleanEnv = EBooleanEnv.FALSE;

  @ValidateIf(
    (environment: EnvironmentVariables) =>
      environment.STAGE_ENV === EStageEnv.PRODUCTION ||
      environment.SUPERADMIN_EMAIL !== undefined ||
      environment.SUPERADMIN_PASSWORD !== undefined,
  )
  @IsEmail()
  SUPERADMIN_EMAIL?: string;

  @ValidateIf(
    (environment: EnvironmentVariables) =>
      environment.STAGE_ENV === EStageEnv.PRODUCTION ||
      environment.SUPERADMIN_EMAIL !== undefined ||
      environment.SUPERADMIN_PASSWORD !== undefined,
  )
  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  SUPERADMIN_PASSWORD?: string;

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
  @IsIn(Object.values(EBooleanEnv))
  ENABLE_BULL_BOARD: EBooleanEnv = EBooleanEnv.FALSE;

  @IsOptional()
  @IsString()
  BULL_BOARD_USERNAME?: string;

  @IsOptional()
  @IsString()
  BULL_BOARD_PASSWORD?: string;

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

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
