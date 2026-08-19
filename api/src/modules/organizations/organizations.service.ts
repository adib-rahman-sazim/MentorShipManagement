import { Injectable } from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";

import { CreateOrganizationInteractor } from "./interactors/create-organization.interactor";
import { ListOrganizationMembersInteractor } from "./interactors/list-organization-members.interactor";
import { ListOrganizationsInteractor } from "./interactors/list-organizations.interactor";
import type {
  CreateOrganizationDto,
  ListOrganizationMembersQueryDto,
  ListOrganizationsQueryDto,
} from "./organizations.dtos";
import type {
  OrganizationResponse,
  PaginatedOrganizationMembersResponse,
  PaginatedOrganizationsResponse,
} from "./organizations.responses";

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly createOrganizationInteractor: CreateOrganizationInteractor,
    private readonly listOrganizationsInteractor: ListOrganizationsInteractor,
    private readonly listOrganizationMembersInteractor: ListOrganizationMembersInteractor,
  ) {}

  create(
    dto: CreateOrganizationDto,
    userId: string,
    roles: EUserRole[],
  ): Promise<OrganizationResponse> {
    return this.createOrganizationInteractor.execute({ dto, userId, roles });
  }

  list(
    query: ListOrganizationsQueryDto,
    userId: string,
    roles: EUserRole[],
  ): Promise<PaginatedOrganizationsResponse> {
    return this.listOrganizationsInteractor.execute({ query, userId, roles });
  }

  listMembers(
    organizationId: string,
    query: ListOrganizationMembersQueryDto,
  ): Promise<PaginatedOrganizationMembersResponse> {
    return this.listOrganizationMembersInteractor.execute({ organizationId, query });
  }
}
