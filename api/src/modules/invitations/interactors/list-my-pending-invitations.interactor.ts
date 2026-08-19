import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { InvitationsRepository } from "../invitations.repository";
import type { InvitationResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class ListMyPendingInvitationsInteractor
  implements IBaseInteractor<string, InvitationResponse[]>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute(email: string): Promise<InvitationResponse[]> {
    const invitations = await this.invitationsRepository.findAllPendingByEmail(email);
    return this.invitationsSerializer.serializeMany(invitations);
  }
}
