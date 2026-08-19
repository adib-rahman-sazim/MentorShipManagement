import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import Redis from "ioredis";

import { DEFAULT_REDIS_PORT, REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const password = configService.get<string>("REDIS_PASSWORD");
        return new Redis({
          host: configService.get<string>("REDIS_HOST", "localhost"),
          port: Number.parseInt(configService.get<string>("REDIS_PORT", DEFAULT_REDIS_PORT), 10),
          ...(password ? { password } : {}),
          lazyConnect: false,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
