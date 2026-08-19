import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { computePaginationMetadata } from "@/utils/pagination";

import { isSystemLevelRole } from "../invitations.helpers";
import type { IListInvitationsContext } from "../invitations.interfaces";
import { InvitationsRepository } from "../invitations.repository";
import type { PaginatedInvitationsResponse } from "../invitations.responses";
import { InvitationsSerializer } from "../invitations.serializer";

@Injectable()
export class ListInvitationsInteractor
  implements IBaseInteractor<IListInvitationsContext, PaginatedInvitationsResponse>
{
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly invitationsSerializer: InvitationsSerializer,
  ) {}

  async execute({
    query,
    inviterRole,
    organizationId,
  }: IListInvitationsContext): Promise<PaginatedInvitationsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const isSystemAdmin = isSystemLevelRole(inviterRole);
    const effectiveOrgId = query.organizationId ?? (isSystemAdmin ? undefined : organizationId);

    const { invitations, total } = await this.invitationsRepository.findAllPaginated({
      page,
      limit,
      organizationId: effectiveOrgId,
      includeAllOrganizations: isSystemAdmin && !effectiveOrgId,
      status: query.status,
    });

    return {
      data: this.invitationsSerializer.serializeMany(invitations),
      meta: computePaginationMetadata({ page, limit, totalItems: total }),
    };
  }
}
