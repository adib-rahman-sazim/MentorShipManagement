import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponse } from "@/common/dtos/pagination.dtos";
import { EUserRole } from "@/common/enums/roles.enums";

import { EInvitationStatus } from "./invitations.enums";

export class InvitationOrganizationResponse {
  id!: string;

  name!: string;
}

export class InvitationInviterResponse {
  id!: string;

  email!: string;

  name!: string;
}

export class InvitationResponse {
  id!: string;

  email!: string;

  firstName?: string | null;

  lastName?: string | null;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: string;

  @ApiProperty({ enum: EInvitationStatus, enumName: "EInvitationStatus" })
  status!: EInvitationStatus;

  expiresAt!: Date;

  createdAt!: Date;

  organization?: InvitationOrganizationResponse | null;

  inviter!: InvitationInviterResponse;
}

export class PaginatedInvitationsResponse extends PaginatedResponse {
  data!: InvitationResponse[];
}

export class CreateInvitationResultResponse {
  success!: boolean;

  message!: string;

  invitationId?: string;
}

export class SystemInvitationValidationResponse {
  email!: string;

  firstName?: string | null;

  lastName?: string | null;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;

  inviterEmail!: string;

  expiresAt!: Date;

  @ApiProperty({ enum: EInvitationStatus, enumName: "EInvitationStatus" })
  status!: EInvitationStatus;
}

export class OrganizationInvitationValidationResponse {
  email!: string;

  firstName?: string | null;

  lastName?: string | null;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;

  inviterEmail!: string;

  organizationName!: string;

  organizationSlug!: string;

  expiresAt!: Date;

  @ApiProperty({ enum: EInvitationStatus, enumName: "EInvitationStatus" })
  status!: EInvitationStatus;
}
