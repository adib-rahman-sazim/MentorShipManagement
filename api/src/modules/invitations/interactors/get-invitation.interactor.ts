import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { isSystemLevelRole } from "@/modules/permissions/permissions.role-priority.helpers";

import { INVITATION_ERROR_MESSAGES } from "../invitations.helpers";
import type { IGetInvitationContext } from "../invitations.interfaces";
import { InvitationsRepository } from "../invitations.repository";
import type { InvitationResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class GetInvitationInteractor
  implements IBaseInteractor<IGetInvitationContext, InvitationResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute({
    id,
    inviterRole,
    organizationId,
  }: IGetInvitationContext): Promise<InvitationResponse> {
    const invitation = await this.invitationsRepository.findByIdForActor({
      id,
      organizationId,
      includeAllOrganizations: isSystemLevelRole(inviterRole),
    });

    if (!invitation) {
      throw new NotFoundException(INVITATION_ERROR_MESSAGES.INVITATION_NOT_FOUND);
    }

    return this.invitationsSerializer.serialize(invitation);
  }
}
