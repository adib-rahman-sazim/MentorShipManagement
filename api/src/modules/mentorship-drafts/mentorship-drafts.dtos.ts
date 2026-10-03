import { ApiProperty, PartialType } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

import { EMentorshipDraftOperation } from "@/common/enums/mentorships.enums";

import {
  MENTORSHIP_DRAFT_ERROR_MESSAGES,
  MENTORSHIP_DRAFT_MAX_ITEMS,
  MENTORSHIP_DRAFT_TITLE_MAX_LENGTH,
} from "./mentorship-drafts.constants";
import { MatchesDraftOperation } from "./mentorship-drafts.validators";

export class MentorshipDraftItemDto {
  @ApiProperty({ enum: EMentorshipDraftOperation, enumName: "EMentorshipDraftOperation" })
  @IsEnum(EMentorshipDraftOperation)
  operation!: EMentorshipDraftOperation;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  subordinateId!: string;

  @ApiProperty({ format: "uuid", type: String, required: false, nullable: true })
  @MatchesDraftOperation()
  proposedSupervisorId?: string | null;
}

export class CreateMentorshipDraftDto {
  @ApiProperty({ maxLength: MENTORSHIP_DRAFT_TITLE_MAX_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MENTORSHIP_DRAFT_TITLE_MAX_LENGTH)
  title!: string;

  @ApiProperty({ type: [MentorshipDraftItemDto], maxItems: MENTORSHIP_DRAFT_MAX_ITEMS })
  @IsArray()
  @ArrayMaxSize(MENTORSHIP_DRAFT_MAX_ITEMS)
  @ArrayUnique((item: MentorshipDraftItemDto | null) => item?.subordinateId, {
    message: MENTORSHIP_DRAFT_ERROR_MESSAGES.DUPLICATE_SUBORDINATE,
  })
  @ValidateNested({ each: true })
  @Type(() => MentorshipDraftItemDto)
  items!: MentorshipDraftItemDto[];
}

export class UpdateMentorshipDraftDto extends PartialType(CreateMentorshipDraftDto) {}
