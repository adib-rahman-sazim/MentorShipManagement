import type { EUserRole } from "@/common/enums/roles.enums";
import type { EUserState } from "@/common/enums/users.enums";

import type {
  InviteUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
} from "./users.dtos";

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
  organizationId?: string;
}

export interface IInviteUserResponse {
  success: boolean;
  message: string;
}

export interface IUpdateProfileContext {
  userId: string;
  dto: UpdateProfileDto;
}

export interface IListUsersContext {
  query: ListUsersQueryDto;
  organizationId: string;
}

export interface IUpdateUserContext {
  userId: string;
  dto: UpdateUserDto;
}

export interface IInviteUserContext {
  dto: InviteUserDto;
  organizationId: string;
  inviter: {
    id: string;
    email: string;
    roles: EUserRole[];
  };
  inviterHeaders: Headers;
}
