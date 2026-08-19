import type { EUserRole } from "@/common/enums/roles.enums";

import type {
  CreateOrganizationDto,
  ListOrganizationMembersQueryDto,
  ListOrganizationsQueryDto,
} from "./organizations.dtos";

export interface ICreateOrganizationContext {
  dto: CreateOrganizationDto;
  userId: string;
  roles: EUserRole[];
}

export interface IListOrganizationsContext {
  query: ListOrganizationsQueryDto;
  userId: string;
  roles: EUserRole[];
}

export interface IListOrganizationMembersContext {
  organizationId: string;
  query: ListOrganizationMembersQueryDto;
}
