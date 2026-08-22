import type { EUserState } from "@/common/enums/users.enums";

import type { ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";

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
