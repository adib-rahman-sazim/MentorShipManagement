import type { EUserRole } from "@/common/enums/roles.enums";

import type { CreateInvitationDto, ListInvitationsQueryDto } from "./invitations.dtos";

export interface IInvitationContext {
  inviterId: string;
  inviterRole: EUserRole;
  inviterEmail: string;
  organizationId?: string;
}

export interface ICreateInvitationContext {
  dto: CreateInvitationDto;
  context: IInvitationContext;
  headers: Headers;
}

export interface IListInvitationsContext {
  query: ListInvitationsQueryDto;
  inviterRole: EUserRole;
  organizationId?: string;
}

export interface IGetInvitationContext {
  id: string;
  inviterRole: EUserRole;
  organizationId?: string;
}

export interface ICancelInvitationContext {
  id: string;
  inviterRole: EUserRole;
  organizationId?: string;
}

export interface IResendInvitationContext {
  id: string;
  context: IInvitationContext;
  headers: Headers;
}

export interface ICreateSystemInvitationData {
  email: string;
  role: string;
  expiresAt: Date;
  inviterId: string;
  token: string;
  firstName?: string;
  lastName?: string;
}

export interface ICreateOrganizationInvitationData {
  email: string;
  role: string;
  expiresAt: Date;
  inviterId: string;
  organizationId: string;
  firstName?: string;
  lastName?: string;
}
