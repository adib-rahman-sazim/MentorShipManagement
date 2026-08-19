import type { MiddlewareConsumer, NestModule, OnModuleInit } from "@nestjs/common";
import { Inject, Logger, Module } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

import { MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { MikroORM as PostgreSqlMikroORM } from "@mikro-orm/postgresql";

import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";

import { Account } from "@/common/entities/accounts.entity";
import { Invitation } from "@/common/entities/invitations.entity";
import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { Session } from "@/common/entities/sessions.entity";
import { User } from "@/common/entities/users.entity";
import { Verification } from "@/common/entities/verifications.entity";
import type { IEmailService } from "@/modules/emails/email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "@/modules/emails/emails.constants";
import { EmailsModule } from "@/modules/emails/emails.module";

import { createAuthInstance } from "./auth.config";
import { BETTER_AUTH_BASE_PATH } from "./auth.constants";
import type { IBetterAuthInstance } from "./auth.interfaces";
import { AuthOrganizationHooks } from "./auth.organization.hooks";
import { AuthService } from "./auth.service";
import { AuthInvitationProcessor } from "./auth-invitation.processor";

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      Session,
      Account,
      Verification,
      Organization,
      Member,
      Invitation,
    ]),
    EmailsModule,
  ],
  providers: [AuthService, AuthInvitationProcessor, AuthOrganizationHooks],
  exports: [AuthService],
})
export class AuthModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);
  private auth: IBetterAuthInstance;

  constructor(
    private readonly authService: AuthService,
    private readonly adapter: HttpAdapterHost,
    @Inject(MikroORM) private readonly orm: PostgreSqlMikroORM,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
    private readonly authInvitationProcessor: AuthInvitationProcessor,
    private readonly authOrganizationHooks: AuthOrganizationHooks,
  ) {
    this.auth = createAuthInstance({
      orm: this.orm,
      emailService: this.emailService,
      authInvitationProcessor: this.authInvitationProcessor,
      authOrganizationHooks: this.authOrganizationHooks,
    });
    this.authService.setAuth(this.auth);
  }

  onModuleInit() {
    this.logger.log("AuthModule initialized BetterAuth");
  }

  configure(_consumer: MiddlewareConsumer) {
    const handler = toNodeHandler(this.auth);
    const httpAdapter = this.adapter.httpAdapter;
    const allowedOrigin = process.env.WEB_CLIENT_BASE_URL;

    const authHandler = (req: Request, res: Response) => {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin, x-invitation-token",
      );

      if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
      }

      req.url = req.originalUrl;

      return handler(req, res);
    };

    httpAdapter.get(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);
    httpAdapter.post(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);
    httpAdapter.put(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);
    httpAdapter.delete(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);
    httpAdapter.patch(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);
    httpAdapter.options(`${BETTER_AUTH_BASE_PATH}/{*path}`, authHandler);

    httpAdapter.get(BETTER_AUTH_BASE_PATH, authHandler);
    httpAdapter.post(BETTER_AUTH_BASE_PATH, authHandler);
    httpAdapter.options(BETTER_AUTH_BASE_PATH, authHandler);

    this.logger.log(`Registered BetterAuth handler on '${BETTER_AUTH_BASE_PATH}'`);
  }
}
