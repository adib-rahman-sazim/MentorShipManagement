import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";

import type { Job } from "bullmq";

import { DEFAULT_QUEUE_PROCESSOR_CONCURRENCY, QUEUE_NAMES } from "@/common/queue/queue.constants";

import type { IExampleJobPayload, IExampleJobResult } from "./example-jobs.interfaces";

@Processor(QUEUE_NAMES.EXAMPLE_JOBS, {
  concurrency: Number(
    process.env.QUEUE_PROCESSOR_CONCURRENCY ?? DEFAULT_QUEUE_PROCESSOR_CONCURRENCY,
  ),
})
export class ExampleJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExampleJobsProcessor.name);

  async process(job: Job<IExampleJobPayload>): Promise<IExampleJobResult> {
    this.logger.log(`Processing example job ${job.id ?? "unknown"}`);

    return {
      processed: true,
      message: job.data.message,
    };
  }
}
