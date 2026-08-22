import type { EUserRole } from "@/common/enums/roles.enums";
import type { EUserState } from "@/common/enums/users.enums";

import type { ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";

export interface IUserResponse {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string;
  state: EUserState;
  role: EUserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaginatedUsersResponse {
  data: IUserResponse[];
  meta: IPaginationMeta;
}

export interface IFindUsersOptions {
  page: number;
  limit: number;
  search?: string;
  state?: EUserState;
}

export interface IUpdateProfileContext {
  userId: string;
  dto: UpdateProfileDto;
}

export interface IListUsersContext {
  query: ListUsersQueryDto;
}

export interface IUpdateUserContext {
  userId: string;
  dto: UpdateUserDto;
}
