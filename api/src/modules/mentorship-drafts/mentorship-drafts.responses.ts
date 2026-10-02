import { ApiProperty } from "@nestjs/swagger";

import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { AbstractApiResponse } from "@/common/interceptors/response-transform.interceptor.responses";
import { PaginationMetaResponse } from "@/modules/users/users.responses";

import { EMentorshipDraftAction, EMentorshipDraftErrorCode } from "./mentorship-drafts.enums";

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

export class MentorshipDraftStaleItemResponse {
  @ApiProperty({ format: "uuid" })
  subordinateId!: string;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  expectedSupervisorId!: string | null;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  currentSupervisorId!: string | null;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  changedByDraftId!: string | null;
}

export class MentorshipDraftStaleItemsResponse extends AbstractApiResponse {
  @ApiProperty({ enum: EMentorshipDraftErrorCode, enumName: "EMentorshipDraftErrorCode" })
  errorCode!: EMentorshipDraftErrorCode;

  @ApiProperty({ type: [MentorshipDraftStaleItemResponse] })
  errors!: MentorshipDraftStaleItemResponse[];
}

export class MentorshipDraftPersonResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;
}

export class MentorshipDraftDetailItemResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: EMentorshipDraftOperation, enumName: "EMentorshipDraftOperation" })
  operation!: EMentorshipDraftOperation;

  @ApiProperty({ type: MentorshipDraftPersonResponse })
  subordinate!: MentorshipDraftPersonResponse;

  @ApiProperty({ type: MentorshipDraftPersonResponse, nullable: true })
  proposedSupervisor!: MentorshipDraftPersonResponse | null;

  @ApiProperty({ format: "uuid", type: String, nullable: true })
  expectedCurrentMentorshipId!: string | null;
}

export class MentorshipDraftSummaryResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ enum: EMentorshipDraftStatus, enumName: "EMentorshipDraftStatus" })
  status!: EMentorshipDraftStatus;

  @ApiProperty({ type: MentorshipDraftPersonResponse })
  createdBy!: MentorshipDraftPersonResponse;

  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: Date, nullable: true })
  submittedAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  decidedAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  publishedAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty({ enum: EMentorshipDraftAction, enumName: "EMentorshipDraftAction", isArray: true })
  allowedActions!: EMentorshipDraftAction[];
}

export class MentorshipDraftDetailResponse extends MentorshipDraftSummaryResponse {
  @ApiProperty({ type: MentorshipDraftPersonResponse, nullable: true })
  reviewedBy!: MentorshipDraftPersonResponse | null;

  @ApiProperty({ type: MentorshipDraftPersonResponse, nullable: true })
  approvedBy!: MentorshipDraftPersonResponse | null;

  @ApiProperty({ type: MentorshipDraftPersonResponse, nullable: true })
  publishedBy!: MentorshipDraftPersonResponse | null;

  @ApiProperty({ type: MentorshipDraftPersonResponse, nullable: true })
  cancelledBy!: MentorshipDraftPersonResponse | null;

  @ApiProperty({ type: String, nullable: true })
  decisionComment!: string | null;

  @ApiProperty({ type: [MentorshipDraftDetailItemResponse] })
  items!: MentorshipDraftDetailItemResponse[];
}

export class MentorshipDraftDetailApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: MentorshipDraftDetailResponse })
  data!: MentorshipDraftDetailResponse;
}

export class PaginatedMentorshipDraftsResponse {
  @ApiProperty({ type: [MentorshipDraftSummaryResponse] })
  data!: MentorshipDraftSummaryResponse[];

  @ApiProperty({ type: PaginationMetaResponse })
  meta!: PaginationMetaResponse;
}

export class PaginatedMentorshipDraftsApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: PaginatedMentorshipDraftsResponse })
  data!: PaginatedMentorshipDraftsResponse;
}
