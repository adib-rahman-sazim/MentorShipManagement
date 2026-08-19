import { PaginatedResponse } from "@/common/dtos/pagination.dtos";

export class OrganizationResponse {
  id!: string;

  name!: string;

  slug!: string;

  logo?: string | null;

  createdAt!: Date;

  updatedAt!: Date;
}

export class PaginatedOrganizationsResponse extends PaginatedResponse {
  data!: OrganizationResponse[];
}

export class OrganizationMemberResponse {
  id!: string;

  role?: string | null;

  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
  };
}

export class PaginatedOrganizationMembersResponse extends PaginatedResponse {
  data!: OrganizationMemberResponse[];
}
