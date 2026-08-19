import { Injectable } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";
import { computePaginationMetadata } from "@/utils/pagination";

import type { IListOrganizationsContext } from "../organizations.interfaces";
import { OrganizationsRepository } from "../organizations.repository";
import type { PaginatedOrganizationsResponse } from "../organizations.responses";
import { OrganizationsSerializer } from "../organizations.serializer";

@Injectable()
export class ListOrganizationsInteractor
  implements IBaseInteractor<IListOrganizationsContext, PaginatedOrganizationsResponse>
{
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private readonly organizationsSerializer: OrganizationsSerializer,
  ) {}

  async execute({
    query,
    userId,
    roles,
  }: IListOrganizationsContext): Promise<PaginatedOrganizationsResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const effectiveRole = resolveEffectiveRole(roles);
    const isSuperAdmin = effectiveRole === EUserRole.SUPER_ADMIN;

    const { organizations, total } = isSuperAdmin
      ? await this.organizationsRepository.findAllOrganizationsPaginated({
          page,
          limit,
          search: query.search,
        })
      : await this.organizationsRepository.findMembershipOrganizationsPaginated({
          userId,
          page,
          limit,
          search: query.search,
        });

    return {
      data: this.organizationsSerializer.serializeMany(organizations),
      meta: computePaginationMetadata({ page, limit, totalItems: total }),
    };
  }
}
