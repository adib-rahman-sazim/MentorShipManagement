import type { Queue } from "bullmq";
import { describe, expect, it, vi } from "vitest";

import { JOB_NAMES } from "@/common/queue/queue.constants";

import type { IExampleJobPayload } from "../example-jobs.interfaces";
import { ExampleJobsProducer } from "../example-jobs.producer";

function createExampleJobPayload(overrides: Partial<IExampleJobPayload> = {}): IExampleJobPayload {
  return {
    message: "Process this",
    ...overrides,
  };
}

function createMockQueue(jobId = "job-1"): Queue<IExampleJobPayload> {
  return {
    add: vi.fn().mockResolvedValue({ id: jobId }),
  } as unknown as Queue<IExampleJobPayload>;
}

describe("ExampleJobsProducer", () => {
  it("enqueues an example job", async () => {
    const queue = createMockQueue();
    const producer = new ExampleJobsProducer(queue);
    const payload = createExampleJobPayload();

    await expect(producer.enqueue(payload)).resolves.toBe("job-1");
    expect(queue.add).toHaveBeenCalledWith(JOB_NAMES.PROCESS_EXAMPLE_JOB, payload);
  });
});
