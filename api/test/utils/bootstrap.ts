import { ValidationPipe } from "@nestjs/common";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { AppModule } from "@/app.module";
import { S3Service } from "@/common/aws/s3-service/s3-service";
import ormConfig from "@/db/db.config";
import { AI_MODEL_PROVIDER } from "@/modules/ai-sdk/ai-sdk.constants";
import { type IAiProvider } from "@/modules/ai-sdk/ai-sdk.interfaces";
import { DocumentSigningService } from "@/modules/document-signing/document-signing.service";
import { DOCUMENT_VECTOR_STORE_CONFIG } from "@/modules/document-vector-store/document-vector-store.constants";
import { DocumentVectorStoreService } from "@/modules/document-vector-store/document-vector-store.service";
import { type IEmailService } from "@/modules/emails/email-service.interfaces";
import { EMAIL_SERVICE_TOKEN } from "@/modules/emails/emails.constants";
import { FEATURE_FLAGS_STRATEGY } from "@/modules/feature-flags/feature-flags.constants";
import { FileUploadsService } from "@/modules/file-uploads/file-uploads.service";
import { PAYMENT_PROVIDER } from "@/modules/payments/payments.constants";
import { PdfGenerationService } from "@/modules/pdf-generation/pdf-generation.service";

import { getMockPaymentProvider } from "../payments/payments.helpers";
import { ControllableFeatureFlagsStrategy } from "./feature-flags.test-strategy";

export const bootstrapTestServer = async () => {
  const featureFlagsStrategy = new ControllableFeatureFlagsStrategy();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(S3Service)
    .useValue(mockDeep<S3Service>({ funcPropSupport: true }))
    .overrideProvider(FileUploadsService)
    .useValue(mockDeep<FileUploadsService>({ funcPropSupport: true }))
    .overrideProvider(PdfGenerationService)
    .useValue(mockDeep<PdfGenerationService>({ funcPropSupport: true }))
    .overrideProvider(DocumentSigningService)
    .useValue(mockDeep<DocumentSigningService>({ funcPropSupport: true }))
    .overrideProvider(EMAIL_SERVICE_TOKEN)
    .useValue(mockDeep<IEmailService>({ funcPropSupport: true }))
    .overrideProvider(DOCUMENT_VECTOR_STORE_CONFIG)
    .useValue({ vectorStoreId: "test-vector-store-id" })
    .overrideProvider(DocumentVectorStoreService)
    .useValue(mockDeep<DocumentVectorStoreService>({ funcPropSupport: true }))
    .overrideProvider(AI_MODEL_PROVIDER)
    .useValue(mockDeep<IAiProvider>({ funcPropSupport: true }))
    .overrideProvider(PAYMENT_PROVIDER)
    .useValue(getMockPaymentProvider())
    .overrideProvider(FEATURE_FLAGS_STRATEGY)
    .useValue(featureFlagsStrategy)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
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
