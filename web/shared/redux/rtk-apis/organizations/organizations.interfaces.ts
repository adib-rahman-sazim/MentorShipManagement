import { TPaginationMetadata } from "@/shared/typedefs";

export interface IOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPaginatedOrganizationsResponse {
  data: IOrganizationResponse[];
  meta: TPaginationMetadata;
}

export interface ICreateOrganizationDto {
  name: string;
  slug?: string;
}

export interface IListOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IOrganizationMemberUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

export interface IOrganizationMemberResponse {
  id: string;
  role?: string | null;
  user: IOrganizationMemberUserResponse;
}

export interface IListOrganizationMembersParams {
  organizationId: string;
  page?: number;
  limit?: number;
}

export interface IPaginatedOrganizationMembersResponse {
  data: IOrganizationMemberResponse[];
  meta: TPaginationMetadata;
}
