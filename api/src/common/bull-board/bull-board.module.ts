import { getQueueToken } from "@nestjs/bullmq";
import type { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, ModuleRef } from "@nestjs/core";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import type { Queue } from "bullmq";

import { EStageEnv } from "@/common/enums/environment-variables.enums";
import type { IEnvironmentVariables } from "@/common/interfaces/environment-variables.interfaces";
import { QUEUE_NAMES } from "@/common/queue/queue.constants";

import { BULL_BOARD_ALLOWED_STAGE_ENVS, BULL_BOARD_BASE_PATH } from "./bull-board.constants";
import { createBullBoardBasicAuthMiddleware } from "./bull-board.helpers";

@Module({})
export class BullBoardModule implements NestModule {
  private readonly logger = new Logger(BullBoardModule.name);

  constructor(
    private readonly adapter: HttpAdapterHost,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private readonly moduleRef: ModuleRef,
  ) {}

  configure(_consumer: MiddlewareConsumer): void {
    const shouldEnableBullBoard = this.configService.get<string>("ENABLE_BULL_BOARD") === "true";
    const stageEnv = this.configService.get<string>("STAGE_ENV");

    if (!shouldEnableBullBoard) {
      this.logger.log("Bull Board is disabled (ENABLE_BULL_BOARD is not 'true')");
      return;
    }

    if (!stageEnv || !BULL_BOARD_ALLOWED_STAGE_ENVS.includes(stageEnv as EStageEnv)) {
      this.logger.warn(
        `Bull Board is disabled in '${stageEnv}' environment. Only available in: ${BULL_BOARD_ALLOWED_STAGE_ENVS.join(
          ", ",
        )}`,
      );
      return;
    }

    const httpAdapter = this.adapter.httpAdapter;
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(BULL_BOARD_BASE_PATH);

    const queues = Object.values(QUEUE_NAMES).map((queueName) => {
      const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), { strict: false });
      return new BullMQAdapter(queue);
    });

    createBullBoard({ queues, serverAdapter });

    const username = this.configService.get<string>("BULL_BOARD_USERNAME");
    const password = this.configService.get<string>("BULL_BOARD_PASSWORD");
    const hasBasicAuth = !!username && !!password;

    if (!hasBasicAuth) {
      this.logger.warn(
        "Bull Board is disabled because BULL_BOARD_USERNAME or BULL_BOARD_PASSWORD is not set",
      );
      return;
    }

    httpAdapter.use(BULL_BOARD_BASE_PATH, createBullBoardBasicAuthMiddleware(username, password));
    this.logger.log("Bull Board basic auth enabled");
    httpAdapter.use(BULL_BOARD_BASE_PATH, serverAdapter.getRouter());
    this.logger.log(`Bull Board dashboard mounted at '${BULL_BOARD_BASE_PATH}'`);
  }
}
