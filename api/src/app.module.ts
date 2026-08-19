import type { MiddlewareConsumer } from "@nestjs/common";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { AuditLoggingModule } from "./common/audit-logging/audit-logging.module";
import { AuditLoggingSubscriber } from "./common/audit-logging/audit-logging.subscriber";
import { BullBoardModule } from "./common/bull-board/bull-board.module";
import { SessionGuard } from "./common/guards/session.guard";
import { RawBodyParserMiddleware } from "./common/middleware/raw-body-parser.middleware";
import { AppLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { SkipBodyParsingForAuthMiddleware } from "./common/middleware/skip-body-parsing-for-auth.middleware";
import { QueueModule } from "./common/queue/queue.module";
import { validate } from "./common/validators/env.validator";
import ormConfig from "./db/db.config";
import { EAiProvider } from "./modules/ai-sdk/ai-sdk.enums";
import { AiSdkModule } from "./modules/ai-sdk/ai-sdk.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CaslModule } from "./modules/casl/casl.module";
import { DocumentSigningModule } from "./modules/document-signing/document-signing.module";
import { DocumentVectorStoreModule } from "./modules/document-vector-store/document-vector-store.module";
import { EmailsModule } from "./modules/emails/emails.module";
import { ExampleJobsModule } from "./modules/example-jobs/example-jobs.module";
import { FeatureFlagsModule } from "./modules/feature-flags/feature-flags.module";
import { FileUploadsModule } from "./modules/file-uploads/file-uploads.module";
import { HealthModule } from "./modules/health/health.module";
import { InvitationsModule } from "./modules/invitations/invitations.module";
import { MembersModule } from "./modules/members/members.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { PAYMENTS_WEBHOOK_ROUTE } from "./modules/payments/payments.constants";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PdfGenerationModule } from "./modules/pdf-generation/pdf-generation.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { RedisModule } from "./modules/redis/redis.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsersModule } from "./modules/users/users.module";
import { WebsocketExampleModule } from "./modules/websocket-example/websocket-example.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: false,
      isGlobal: true,
      validate,
    }),

    MikroOrmModule.forRootAsync({
      imports: [AuditLoggingModule],
      useFactory: (auditLoggingSubscriber: AuditLoggingSubscriber) => ({
        ...ormConfig,
        subscribers: [auditLoggingSubscriber],
      }),
      inject: [AuditLoggingSubscriber],
    }),

    EmailsModule,

    AuditLoggingModule,

    RedisModule,
    QueueModule,
    BullBoardModule,

    CaslModule,

    AiSdkModule.forRoot({
      providerType: (process.env.AI_PROVIDER as EAiProvider) || EAiProvider.AI_GATEWAY,
    }),
    AuthModule,
    UsersModule,
    MembersModule,
    OrganizationsModule,
    InvitationsModule,
    RolesModule,
    PermissionsModule,
    FeatureFlagsModule,
    FileUploadsModule,
    WebsocketExampleModule,
    HealthModule,
    PdfGenerationModule,
    DocumentSigningModule,
    DocumentVectorStoreModule.forRoot(),
    PaymentsModule,
    SubscriptionsModule,
    ExampleJobsModule,
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
    consumer.apply(RawBodyParserMiddleware).forRoutes(PAYMENTS_WEBHOOK_ROUTE);
    consumer.apply(SkipBodyParsingForAuthMiddleware).forRoutes("{*path}");
    consumer.apply(AppLoggerMiddleware).forRoutes("{*path}");
  }
}
