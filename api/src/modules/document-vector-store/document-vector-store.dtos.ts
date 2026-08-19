import { ApiProperty } from "@nestjs/swagger";

import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UploadDocumentRequestDto {
  @IsString()
  fileKey!: string;
}

export class UploadDocumentResponseDto {
  @IsString()
  fileId!: string;

  @IsString()
  vectorStoreId!: string;

  @IsString()
  filename!: string;
}

export class QueryDocumentRequestDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxResults?: number = 5;
}

export class QueryDocumentResultDto {
  @IsString()
  fileId!: string;

  @IsString()
  filename!: string;

  @IsString()
  content!: string;

  @IsNumber()
  score!: number;
}

export class QueryDocumentResponseDto {
  @ApiProperty({ type: [QueryDocumentResultDto] })
  results!: QueryDocumentResultDto[];
}
