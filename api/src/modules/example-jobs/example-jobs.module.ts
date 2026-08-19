import { Module } from "@nestjs/common";

import { ExampleJobsProcessor } from "./example-jobs.processor";
import { ExampleJobsProducer } from "./example-jobs.producer";

@Module({
  providers: [ExampleJobsProducer, ExampleJobsProcessor],
  exports: [ExampleJobsProducer],
})
export class ExampleJobsModule {}
