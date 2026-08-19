import { GoneException, Injectable, NotFoundException } from "@nestjs/common";

import dayjs from "dayjs";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { EInvitationStatus } from "../invitations.enums";
import { INVITATION_ERROR_MESSAGES } from "../invitations.helpers";
import { InvitationsRepository } from "../invitations.repository";
import type { SystemInvitationValidationResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class ValidateSystemInvitationInteractor
  implements IBaseInteractor<string, SystemInvitationValidationResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute(token: string): Promise<SystemInvitationValidationResponse> {
    const invitation = await this.invitationsRepository.findByToken(token);

    if (!invitation) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    if (invitation.status !== EInvitationStatus.PENDING) {
      throw new GoneException(INVITATION_ERROR_MESSAGES.INVITATION_NO_LONGER_VALID);
    }

    if (dayjs(invitation.expiresAt).isBefore(dayjs())) {
      throw new GoneException(INVITATION_ERROR_MESSAGES.INVITATION_EXPIRED);
    }

    return this.invitationsSerializer.serializeSystemValidation(invitation);
  }
}
