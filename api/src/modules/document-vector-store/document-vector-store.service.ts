import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { OpenAI, toFile } from "openai";

import { S3Service } from "@/common/aws/s3-service/s3-service";

import {
  DOCUMENT_VECTOR_STORE_CONFIG,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_DISPLAY,
  S3FILE_DOWNLOAD_TIMEOUT_MS,
} from "./document-vector-store.constants";
import { QueryDocumentResultDto, UploadDocumentResponseDto } from "./document-vector-store.dtos";
import { type IDocumentVectorStoreConfig } from "./document-vector-store.interfaces";

@Injectable()
export class DocumentVectorStoreService {
  private readonly logger = new Logger(DocumentVectorStoreService.name);
  private openai: OpenAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    private readonly httpService: HttpService,
    @Inject(DOCUMENT_VECTOR_STORE_CONFIG)
    private readonly vectorStoreConfig: IDocumentVectorStoreConfig,
  ) {}

  async uploadDocument(fileKey: string): Promise<UploadDocumentResponseDto> {
    this.logger.log(`Uploading document with key: ${fileKey}`);

    try {
      const vectorStoreId = this.getVectorStoreId();
      const openai = this.getOpenAIClient();

      const isPresignedUrl = fileKey.startsWith("http://") || fileKey.startsWith("https://");
      const presignedUrl = isPresignedUrl
        ? fileKey
        : await this.s3Service.getPresignedUrlForDownload(fileKey);

      const keyPath = new URL(fileKey).pathname;

      const filename = decodeURIComponent(keyPath.split("/").pop() || "document");

      const response = await this.httpService.axiosRef.get(presignedUrl, {
        responseType: "arraybuffer",
        timeout: S3FILE_DOWNLOAD_TIMEOUT_MS,
      });

      if (response.status !== 200) {
        const errorBody = Buffer.from(response.data).toString("utf-8");

        this.logger.log(
          `Failed to download file from S3. Status: ${response.status}, Body: ${errorBody}`,
        );

        throw new HttpException(`S3 download failed`, response.status);
      }

      const buffer = Buffer.from(response.data);

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException(
          `File size (${(buffer.length / 1024 / 1024).toFixed(
            2,
          )}MB) exceeds the maximum allowed size of ${MAX_FILE_SIZE_DISPLAY}`,
        );
      }

      const uploadable = await toFile(buffer, filename);

      const vectorStoreFile = await openai.vectorStores.files.upload(vectorStoreId, uploadable);

      this.logger.log(
        `File added to vector store: ${vectorStoreFile.id}, status: ${vectorStoreFile.status}`,
      );

      return {
        fileId: vectorStoreFile.id,
        vectorStoreId,
        filename,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(`Failed to upload document: ${fileKey}`, error);
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    }
  }

  async queryDocuments(query: string, maxResults: number = 5): Promise<QueryDocumentResultDto[]> {
    this.logger.log(`Querying documents with: ${query}`);

    try {
      const vectorStoreId = this.getVectorStoreId();
      const openai = this.getOpenAIClient();

      const searchResult = await openai.vectorStores.search(vectorStoreId, {
        query,
        max_num_results: maxResults,
      });

      this.logger.log(`Found ${searchResult.data.length} results`);

      return searchResult.data.map((item) => ({
        fileId: item.file_id,
        filename: item.filename,
        content: item.content?.[0]?.text || "",
        score: item.score,
      }));
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      this.logger.error(`Failed to query documents: ${query}`, error);
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to query documents",
      );
    }
  }

  private getVectorStoreId(): string {
    if (!this.vectorStoreConfig.vectorStoreId) {
      throw new ServiceUnavailableException("OPENAI_VECTOR_STORE_ID is not configured");
    }

    return this.vectorStoreConfig.vectorStoreId;
  }

  private getOpenAIClient(): OpenAI {
    if (this.openai) {
      return this.openai;
    }

    const apiKey = this.configService.get<string>("OPENAI_API_KEY");

    if (!apiKey) {
      throw new ServiceUnavailableException("OPENAI_API_KEY is not configured");
    }

    this.openai = new OpenAI({ apiKey });

    return this.openai;
  }
}
