import { BullModule } from "@nestjs/bullmq";
import type { DynamicModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import type { JobsOptions } from "bullmq";

import {
  DEFAULT_QUEUE_COMPLETED_JOB_RETENTION_S,
  DEFAULT_QUEUE_FAILED_JOB_RETENTION_S,
  DEFAULT_QUEUE_RETRY_ATTEMPTS,
  DEFAULT_QUEUE_RETRY_DELAY_MS,
  QUEUE_BACKOFF_TYPE_EXPONENTIAL,
} from "./queue.constants";
import type { IBuildDefaultJobOptionsOverrides } from "./queue.interfaces";

export function buildDefaultJobOptions(
  configService: ConfigService,
  overrides: IBuildDefaultJobOptionsOverrides = {},
): JobsOptions {
  const {
    attemptsEnv = "QUEUE_RETRY_ATTEMPTS",
    attemptsDefault = DEFAULT_QUEUE_RETRY_ATTEMPTS,
    delayEnv = "QUEUE_RETRY_DELAY",
    delayDefault = DEFAULT_QUEUE_RETRY_DELAY_MS,
    backoffType = QUEUE_BACKOFF_TYPE_EXPONENTIAL,
  } = overrides;

  return {
    attempts: Number.parseInt(configService.get<string>(attemptsEnv, attemptsDefault), 10),
    backoff: {
      type: backoffType,
      delay: Number.parseInt(configService.get<string>(delayEnv, delayDefault), 10),
    },
    removeOnComplete: {
      age: Number.parseInt(
        configService.get<string>(
          "QUEUE_COMPLETED_JOB_RETENTION",
          DEFAULT_QUEUE_COMPLETED_JOB_RETENTION_S,
        ),
        10,
      ),
    },
    removeOnFail: {
      age: Number.parseInt(
        configService.get<string>(
          "QUEUE_FAILED_JOB_RETENTION",
          DEFAULT_QUEUE_FAILED_JOB_RETENTION_S,
        ),
        10,
      ),
    },
  };
}

export function registerStandardQueue(name: string): DynamicModule {
  return BullModule.registerQueueAsync({
    name,
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      defaultJobOptions: buildDefaultJobOptions(configService),
    }),
    inject: [ConfigService],
  });
}
