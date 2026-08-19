import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { TPaginationMetadata } from "@/shared/typedefs";

import { EInvitationStatus } from "./invitations.enums";

export interface IInvitationOrganizationResponse {
  id: string;
  name: string;
}

export interface IInvitationInviterResponse {
  id: string;
  email: string;
  name: string;
}

export interface IInvitationResponse {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  organization?: IInvitationOrganizationResponse | null;
  inviter: IInvitationInviterResponse;
}

export interface IPaginatedInvitationsResponse {
  data: IInvitationResponse[];
  meta: TPaginationMetadata;
}

export interface ICreateInvitationDto {
  email: string;
  firstName?: string;
  lastName?: string;
  role: EUserRole;
  organizationId?: string;
}

export interface ICreateInvitationResultResponse {
  success: boolean;
  message: string;
  invitationId?: string;
}

export interface IListInvitationsParams {
  page?: number;
  limit?: number;
  status?: EInvitationStatus | string;
  organizationId?: string;
}

export interface IValidateSystemInvitationParams {
  token: string;
}

export interface IValidateOrganizationInvitationParams {
  id: string;
}

export interface ISystemInvitationValidationResponse {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: EUserRole;
  inviterEmail: string;
  expiresAt: string;
  status: string;
}

export interface IOrganizationInvitationValidationResponse {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: EUserRole;
  inviterEmail: string;
  organizationName: string;
  organizationSlug: string;
  expiresAt: string;
  status: string;
}
