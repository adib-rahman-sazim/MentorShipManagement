import { type Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { AppModule } from "@/app.module";
import { CustomBaseExceptionFilter } from "@/common/filters/custom-base-exception.filter";
import ormConfig from "@/db/db.config";
import { FEATURE_FLAGS_STRATEGY } from "@/modules/feature-flags/feature-flags.constants";

import { ControllableFeatureFlagsStrategy } from "./feature-flags.test-strategy";

export const bootstrapTestServer = async ({ withExceptionFilter = false } = {}) => {
  const featureFlagsStrategy = new ControllableFeatureFlagsStrategy();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(FEATURE_FLAGS_STRATEGY)
    .useValue(featureFlagsStrategy)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (withExceptionFilter) {
    app.useGlobalFilters(new CustomBaseExceptionFilter(mockDeep<Logger>()));
  }

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
    prefix: "api/v",
  });
  const httpServer = app.getHttpServer();
  const orm = await MikroORM.init(ormConfig);
  const entityManager = orm.em.fork();
  await app.init();

  return {
    appInstance: app,
    moduleFixture,
    httpServerInstance: httpServer,
    dbServiceInstance: entityManager,
    ormInstance: orm,
    featureFlagsStrategy,
  };
};
