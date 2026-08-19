import { GoneException, Injectable, NotFoundException } from "@nestjs/common";

import dayjs from "dayjs";

import { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { EInvitationStatus } from "../invitations.enums";
import { INVITATION_ERROR_MESSAGES } from "../invitations.helpers";
import { InvitationsRepository } from "../invitations.repository";
import type { OrganizationInvitationValidationResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class ValidateOrganizationInvitationInteractor
  implements IBaseInteractor<string, OrganizationInvitationValidationResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute(id: string): Promise<OrganizationInvitationValidationResponse> {
    const invitation = await this.invitationsRepository.findById(id);

    if (!invitation) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    if (
      invitation.role !== EUserRole.CUSTOMER ||
      invitation.status !== EInvitationStatus.PENDING ||
      dayjs(invitation.expiresAt).isBefore(dayjs()) ||
      !invitation.organization
    ) {
      throw new GoneException(INVITATION_ERROR_MESSAGES.INVITATION_NO_LONGER_VALID);
    }

    return this.invitationsSerializer.serializeOrganizationValidation(invitation);
  }
}
