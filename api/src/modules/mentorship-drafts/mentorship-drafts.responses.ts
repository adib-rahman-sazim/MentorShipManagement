import { ApiProperty } from "@nestjs/swagger";

import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { AbstractApiResponse } from "@/common/interceptors/response-transform.interceptor.responses";

import { EMentorshipDraftErrorCode } from "./mentorship-drafts.enums";

export class MentorshipDraftItemResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: EMentorshipDraftOperation, enumName: "EMentorshipDraftOperation" })
  operation!: EMentorshipDraftOperation;

  @ApiProperty({ format: "uuid" })
  subordinateId!: string;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  proposedSupervisorId!: string | null;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  expectedCurrentMentorshipId!: string | null;
}

export class MentorshipDraftResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: EMentorshipDraftStatus, enumName: "EMentorshipDraftStatus" })
  status!: EMentorshipDraftStatus;

  @ApiProperty({ format: "uuid" })
  createdById!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: [MentorshipDraftItemResponse] })
  items!: MentorshipDraftItemResponse[];
}

export class MentorshipDraftApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: MentorshipDraftResponse })
  data!: MentorshipDraftResponse;
}

export class MentorshipDraftItemViolationResponse {
  @ApiProperty({ format: "uuid" })
  subordinateId!: string;

  @ApiProperty({ enum: EMentorshipViolation, enumName: "EMentorshipViolation", isArray: true })
  violations!: EMentorshipViolation[];
}

export class MentorshipDraftInvalidItemsResponse extends AbstractApiResponse {
  @ApiProperty({ enum: EMentorshipDraftErrorCode, enumName: "EMentorshipDraftErrorCode" })
  errorCode!: EMentorshipDraftErrorCode;

  @ApiProperty({ type: [MentorshipDraftItemViolationResponse] })
  errors!: MentorshipDraftItemViolationResponse[];
}
