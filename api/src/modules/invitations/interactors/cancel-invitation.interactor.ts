import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { isSystemLevelRole } from "@/modules/permissions/permissions.role-priority.helpers";

import { EInvitationStatus } from "../invitations.enums";
import { INVITATION_ERROR_MESSAGES, validateInvitationRules } from "../invitations.helpers";
import type { ICancelInvitationContext } from "../invitations.interfaces";
import { InvitationsRepository } from "../invitations.repository";
import type { InvitationResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class CancelInvitationInteractor
  implements IBaseInteractor<ICancelInvitationContext, InvitationResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute({
    id,
    inviterRole,
    organizationId,
  }: ICancelInvitationContext): Promise<InvitationResponse> {
    const invitation = await this.invitationsRepository.findByIdForActor({
      id,
      organizationId,
      includeAllOrganizations: isSystemLevelRole(inviterRole),
    });

    if (!invitation) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    if (invitation.status === EInvitationStatus.CANCELED) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_CANCELED);
    }

    if (invitation.status === EInvitationStatus.ACCEPTED) {
      throw new BadRequestException(INVITATION_ERROR_MESSAGES.INVITATION_ALREADY_ACCEPTED);
    }

    const targetRole = invitation.role as EUserRole;
    const validationResult = validateInvitationRules({
      inviterRole,
      targetRole,
      organizationId: invitation.organization?.id,
    });

    if (!validationResult.valid) {
      throw new ForbiddenException(
        `You do not have permission to cancel invitations for role '${targetRole}'`,
      );
    }

    invitation.status = EInvitationStatus.CANCELED;
    this.invitationsRepository.persist(invitation);
    await this.invitationsRepository.flush();

    return this.invitationsSerializer.serialize(invitation);
  }
}
