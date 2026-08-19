import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";

import type { Queue } from "bullmq";

import { JOB_NAMES, QUEUE_NAMES } from "@/common/queue/queue.constants";

import type { IExampleJobPayload } from "./example-jobs.interfaces";

@Injectable()
export class ExampleJobsProducer {
  constructor(
    @InjectQueue(QUEUE_NAMES.EXAMPLE_JOBS)
    private readonly exampleJobsQueue: Queue<IExampleJobPayload>,
  ) {}

  async enqueue(payload: IExampleJobPayload): Promise<string | undefined> {
    const job = await this.exampleJobsQueue.add(JOB_NAMES.PROCESS_EXAMPLE_JOB, payload);
    return job.id;
  }
}
