import type { Job } from "bullmq";
import { describe, expect, it } from "vitest";

import type { IExampleJobPayload } from "../example-jobs.interfaces";
import { ExampleJobsProcessor } from "../example-jobs.processor";

function createExampleJobPayload(overrides: Partial<IExampleJobPayload> = {}): IExampleJobPayload {
  return {
    message: "Process this",
    ...overrides,
  };
}

function createExampleJob(payload = createExampleJobPayload()): Job<IExampleJobPayload> {
  return {
    id: "job-1",
    data: payload,
  } as Job<IExampleJobPayload>;
}

describe("ExampleJobsProcessor", () => {
  it("returns the processed job result", async () => {
    const processor = new ExampleJobsProcessor();
    const job = createExampleJob(createExampleJobPayload({ message: "Queued message" }));

    await expect(processor.process(job)).resolves.toEqual({
      processed: true,
      message: "Queued message",
    });
  });
});
