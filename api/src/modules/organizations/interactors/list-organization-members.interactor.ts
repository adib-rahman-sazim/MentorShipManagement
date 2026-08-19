import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { MembersRepository } from "@/modules/members/members.repository";
import { MembersSerializer } from "@/modules/members/members.serializer";
import { computePaginationMetadata } from "@/utils/pagination";

import { ORGANIZATION_ERROR_MESSAGES } from "../organizations.constants";
import type { IListOrganizationMembersContext } from "../organizations.interfaces";
import { OrganizationsRepository } from "../organizations.repository";
import type { PaginatedOrganizationMembersResponse } from "../organizations.responses";

@Injectable()
export class ListOrganizationMembersInteractor
  implements IBaseInteractor<IListOrganizationMembersContext, PaginatedOrganizationMembersResponse>
{
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly membersSerializer: MembersSerializer,
  ) {}

  async execute({
    organizationId,
    query,
  }: IListOrganizationMembersContext): Promise<PaginatedOrganizationMembersResponse> {
    const organization = await this.organizationsRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(ORGANIZATION_ERROR_MESSAGES.ORGANIZATION_NOT_FOUND);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { members, total } = await this.membersRepository.findAllPaginatedByOrganization({
      organizationId,
      page,
      limit,
    });

    return {
      data: this.membersSerializer.serializeMany(members),
      meta: computePaginationMetadata({ page, limit, totalItems: total }),
    };
  }
}
