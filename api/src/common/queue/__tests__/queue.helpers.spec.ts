import { ConfigService } from "@nestjs/config";

import { describe, expect, it } from "vitest";

import {
  DEFAULT_QUEUE_COMPLETED_JOB_RETENTION_S,
  DEFAULT_QUEUE_FAILED_JOB_RETENTION_S,
  DEFAULT_QUEUE_RETRY_ATTEMPTS,
  DEFAULT_QUEUE_RETRY_DELAY_MS,
  QUEUE_BACKOFF_TYPE_EXPONENTIAL,
} from "../queue.constants";
import { buildDefaultJobOptions } from "../queue.helpers";

describe("buildDefaultJobOptions", () => {
  it("returns default retry, backoff, and retention settings", () => {
    const configService = new ConfigService({});

    const options = buildDefaultJobOptions(configService);

    expect(options).toEqual({
      attempts: Number(DEFAULT_QUEUE_RETRY_ATTEMPTS),
      backoff: {
        type: QUEUE_BACKOFF_TYPE_EXPONENTIAL,
        delay: Number(DEFAULT_QUEUE_RETRY_DELAY_MS),
      },
      removeOnComplete: {
        age: Number(DEFAULT_QUEUE_COMPLETED_JOB_RETENTION_S),
      },
      removeOnFail: {
        age: Number(DEFAULT_QUEUE_FAILED_JOB_RETENTION_S),
      },
    });
  });

  it("uses configured retry and retention settings", () => {
    const configService = new ConfigService({
      QUEUE_RETRY_ATTEMPTS: "5",
      QUEUE_RETRY_DELAY: "2500",
      QUEUE_COMPLETED_JOB_RETENTION: "60",
      QUEUE_FAILED_JOB_RETENTION: "120",
    });

    const options = buildDefaultJobOptions(configService);

    expect(options).toMatchObject({
      attempts: 5,
      backoff: { delay: 2500 },
      removeOnComplete: { age: 60 },
      removeOnFail: { age: 120 },
    });
  });
});
