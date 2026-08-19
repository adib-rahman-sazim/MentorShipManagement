import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { TPaginationMetadata } from "@/shared/typedefs";
import { EUserState } from "@/shared/typedefs/api";

export interface IUserResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  name: string;
  image?: string;
  state: EUserState;
  firstLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBackendPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedUsersResponse {
  data: IUserResponse[];
  meta: TPaginationMetadata;
}

export interface IListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  state?: EUserState;
}

export interface IInviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: EUserRole;
}

export interface IUpdateUserDto {
  firstName?: string;
  lastName?: string;
  name?: string;
  image?: string;
  state?: EUserState;
}
