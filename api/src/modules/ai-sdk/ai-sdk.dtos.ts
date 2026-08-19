import { ApiProperty } from "@nestjs/swagger";

import type { ProviderMetadata } from "ai";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { EMessagePartType, EMessageRole } from "./ai-sdk.enums";

export class MessagePartDto {
  @ApiProperty({ enum: EMessagePartType, enumName: "EMessagePartType" })
  @IsEnum(EMessagePartType)
  type!: EMessagePartType;

  @IsOptional()
  @IsString()
  text?: string;
}

export class UIMessageDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ enum: EMessageRole, enumName: "EMessageRole" })
  @IsEnum(EMessageRole)
  role!: EMessageRole;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessagePartDto)
  parts!: MessagePartDto[];

  @IsOptional()
  @IsObject()
  metadata?: ProviderMetadata;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UIMessageDto)
  messages!: UIMessageDto[];

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class CompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
