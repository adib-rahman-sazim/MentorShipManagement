import { Injectable } from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";

import { CancelInvitationInteractor } from "./interactors/cancel-invitation.interactor";
import { CreateInvitationInteractor } from "./interactors/create-invitation.interactor";
import { GetInvitationInteractor } from "./interactors/get-invitation.interactor";
import { ListInvitationsInteractor } from "./interactors/list-invitations.interactor";
import { ListMyPendingInvitationsInteractor } from "./interactors/list-my-pending-invitations.interactor";
import { ResendInvitationInteractor } from "./interactors/resend-invitation.interactor";
import { ValidateOrganizationInvitationInteractor } from "./interactors/validate-organization-invitation.interactor";
import { ValidateSystemInvitationInteractor } from "./interactors/validate-system-invitation.interactor";
import type { CreateInvitationDto, ListInvitationsQueryDto } from "./invitations.dtos";
import type { IInvitationContext } from "./invitations.interfaces";
import type {
  CreateInvitationResultResponse,
  InvitationResponse,
  OrganizationInvitationValidationResponse,
  PaginatedInvitationsResponse,
  SystemInvitationValidationResponse,
} from "./invitations.responses";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly createInvitationInteractor: CreateInvitationInteractor,
    private readonly listInvitationsInteractor: ListInvitationsInteractor,
    private readonly getInvitationInteractor: GetInvitationInteractor,
    private readonly cancelInvitationInteractor: CancelInvitationInteractor,
    private readonly resendInvitationInteractor: ResendInvitationInteractor,
    private readonly validateSystemInvitationInteractor: ValidateSystemInvitationInteractor,
    private readonly validateOrganizationInvitationInteractor: ValidateOrganizationInvitationInteractor,
    private readonly listMyPendingInvitationsInteractor: ListMyPendingInvitationsInteractor,
  ) {}

  async create(
    dto: CreateInvitationDto,
    context: IInvitationContext,
    headers: Headers,
  ): Promise<CreateInvitationResultResponse> {
    return this.createInvitationInteractor.execute({ dto, context, headers });
  }

  async list(
    query: ListInvitationsQueryDto,
    inviterRole: EUserRole,
    organizationId?: string,
  ): Promise<PaginatedInvitationsResponse> {
    return this.listInvitationsInteractor.execute({ query, inviterRole, organizationId });
  }

  async get(
    id: string,
    inviterRole: EUserRole,
    organizationId?: string,
  ): Promise<InvitationResponse> {
    return this.getInvitationInteractor.execute({ id, inviterRole, organizationId });
  }

  async cancel(
    id: string,
    inviterRole: EUserRole,
    organizationId?: string,
  ): Promise<InvitationResponse> {
    return this.cancelInvitationInteractor.execute({ id, inviterRole, organizationId });
  }

  async resend(
    id: string,
    context: IInvitationContext,
    headers: Headers,
  ): Promise<CreateInvitationResultResponse> {
    return this.resendInvitationInteractor.execute({ id, context, headers });
  }

  async validateSystem(token: string): Promise<SystemInvitationValidationResponse> {
    return this.validateSystemInvitationInteractor.execute(token);
  }

  async validateOrganization(id: string): Promise<OrganizationInvitationValidationResponse> {
    return this.validateOrganizationInvitationInteractor.execute(id);
  }

  async listMyPending(email: string): Promise<InvitationResponse[]> {
    return this.listMyPendingInvitationsInteractor.execute(email);
  }
}
