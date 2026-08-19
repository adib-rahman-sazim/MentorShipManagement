import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { DEFAULT_REDIS_PORT } from "@/modules/redis/redis.constants";

import { QUEUE_NAMES } from "./queue.constants";
import { registerStandardQueue } from "./queue.helpers";

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>("REDIS_HOST"),
          port: Number.parseInt(configService.get<string>("REDIS_PORT", DEFAULT_REDIS_PORT), 10),
          password: configService.get<string>("REDIS_PASSWORD"),
        },
        prefix: configService.get<string>("REDIS_QUEUE_PREFIX"),
      }),
      inject: [ConfigService],
    }),
    registerStandardQueue(QUEUE_NAMES.AUDIT_LOGS),
    registerStandardQueue(QUEUE_NAMES.EXAMPLE_JOBS),
  ],
  exports: [BullModule],
})
export class QueueModule {}
