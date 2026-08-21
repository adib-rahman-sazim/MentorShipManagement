import type { MiddlewareConsumer, NestModule, OnModuleInit } from "@nestjs/common";
import { Inject, Logger, Module } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

import { MikroORM } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import type { MikroORM as PostgreSqlMikroORM } from "@mikro-orm/postgresql";

import { toNodeHandler } from "better-auth/node";
import type { Request, Response } from "express";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { Session } from "@/common/entities/sessions.entity";
import { User } from "@/common/entities/users.entity";
import { Verification } from "@/common/entities/verifications.entity";

import { createAuthInstance } from "./auth.config";
import {
  AUTH_CORS_ALLOWED_HEADERS,
  AUTH_CORS_ALLOWED_METHODS,
  BETTER_AUTH_BASE_PATH,
} from "./auth.constants";
import type { IBetterAuthInstance } from "./auth.interfaces";
import { AuthService } from "./auth.service";

@Module({
  imports: [MikroOrmModule.forFeature([User, Session, Account, Verification, Role])],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule, OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);
  private auth: IBetterAuthInstance;

  constructor(
    private readonly authService: AuthService,
    private readonly adapter: HttpAdapterHost,
    @Inject(MikroORM) private readonly orm: PostgreSqlMikroORM,
  ) {
    this.auth = createAuthInstance({ orm: this.orm });
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
      res.setHeader("Access-Control-Allow-Methods", AUTH_CORS_ALLOWED_METHODS);
      res.setHeader("Access-Control-Allow-Headers", AUTH_CORS_ALLOWED_HEADERS);

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