import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { FileUploadsModule } from "@/modules/file-uploads/file-uploads.module";

import { DOCUMENT_VECTOR_STORE_CONFIG } from "./document-vector-store.constants";
import { DocumentVectorStoreController } from "./document-vector-store.controller";
import { IDocumentVectorStoreConfig } from "./document-vector-store.interfaces";
import { DocumentVectorStoreService } from "./document-vector-store.service";

@Module({})
export class DocumentVectorStoreModule {
  static forRoot(): DynamicModule {
    return {
      module: DocumentVectorStoreModule,
      imports: [ConfigModule, FileUploadsModule, HttpModule],
      controllers: [DocumentVectorStoreController],
      providers: [
        DocumentVectorStoreService,
        {
          provide: DOCUMENT_VECTOR_STORE_CONFIG,
          useFactory: (configService: ConfigService): IDocumentVectorStoreConfig => ({
            vectorStoreId: configService.get<string>("OPENAI_VECTOR_STORE_ID") ?? "",
          }),
          inject: [ConfigService],
        },
      ],
      exports: [DocumentVectorStoreService],
    };
  }
}
