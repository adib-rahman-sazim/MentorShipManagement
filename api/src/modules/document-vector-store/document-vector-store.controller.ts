import { Body, Controller, Post, UseInterceptors } from "@nestjs/common";

import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";

import {
  QueryDocumentRequestDto,
  QueryDocumentResponseDto,
  UploadDocumentRequestDto,
  UploadDocumentResponseDto,
} from "./document-vector-store.dtos";
import { DocumentVectorStoreService } from "./document-vector-store.service";

@Controller("document-vector-store")
@UseInterceptors(ResponseTransformInterceptor)
export class DocumentVectorStoreController {
  constructor(private readonly documentVectorStoreService: DocumentVectorStoreService) {}

  @Post("upload")
  uploadDocument(@Body() dto: UploadDocumentRequestDto): Promise<UploadDocumentResponseDto> {
    return this.documentVectorStoreService.uploadDocument(dto.fileKey);
  }

  @Post("query")
  async queryDocument(@Body() dto: QueryDocumentRequestDto): Promise<QueryDocumentResponseDto> {
    const results = await this.documentVectorStoreService.queryDocuments(dto.query, dto.maxResults);

    return { results };
  }
}
