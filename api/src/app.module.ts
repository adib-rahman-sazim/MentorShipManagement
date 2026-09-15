import type { MiddlewareConsumer } from "@nestjs/common";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { BullBoardModule } from "./common/bull-board/bull-board.module";
import { SessionGuard } from "./common/guards/session.guard";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { SkipBodyParsingForAuthMiddleware } from "./common/middleware/skip-body-parsing-for-auth.middleware";
import { QueueModule } from "./common/queue/queue.module";
import { validate } from "./common/validators/env.validator";
import ormConfig from "./db/db.config";
import { AuthModule } from "./modules/auth/auth.module";
import { CaslModule } from "./modules/casl/casl.module";
import { FeatureFlagsModule } from "./modules/feature-flags/feature-flags.module";
import { HealthModule } from "./modules/health/health.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RedisModule } from "./modules/redis/redis.module";
import { RolesModule } from "./modules/roles/roles.module";
import { UsersModule } from "./modules/users/users.module";
import { WebsocketExampleModule } from "./modules/websocket-example/websocket-example.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      validate,
    }),

    MikroOrmModule.forRoot(ormConfig),

    RedisModule,
    QueueModule,
    BullBoardModule,

    CaslModule,

    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    FeatureFlagsModule,
    WebsocketExampleModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: SessionGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SkipBodyParsingForAuthMiddleware).forRoutes("{*path}");
    consumer.apply(AppLoggerMiddleware).forRoutes("{*path}");
  }
}
