import { Injectable } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { InvitationsService } from "@/modules/invitations/invitations.service";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";

import type { IInviteUserContext, IInviteUserResponse } from "../users.interfaces";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class InviteUserInteractor
  implements IBaseInteractor<IInviteUserContext, IInviteUserResponse>
{
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  async execute({
    dto,
    organizationId,
    inviter,
    inviterHeaders,
  }: IInviteUserContext): Promise<IInviteUserResponse> {
    const inviterRole = resolveEffectiveRole(inviter.roles) ?? EUserRole.CUSTOMER;
    const result = await this.invitationsService.create(
      {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? EUserRole.CUSTOMER,
        organizationId,
      },
      {
        inviterId: inviter.id,
        inviterRole,
        inviterEmail: inviter.email,
        organizationId,
      },
      inviterHeaders,
    );

    return this.usersSerializer.serializeInviteResult(result.message, result.success);
  }
}
