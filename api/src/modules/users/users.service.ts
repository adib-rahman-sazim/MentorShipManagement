import { Injectable } from "@nestjs/common";

import { GetCurrentUserInteractor } from "./interactors/get-current-user.interactor";
import { ListUsersInteractor } from "./interactors/list-users.interactor";
import { UpdateProfileInteractor } from "./interactors/update-profile.interactor";
import { UpdateUserInteractor } from "./interactors/update-user.interactor";
import type { ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";
import type { PaginatedUsersResponse, UserResponse } from "./users.responses";

@Injectable()
export class UsersService {
  constructor(
    private readonly getCurrentUserInteractor: GetCurrentUserInteractor,
    private readonly updateProfileInteractor: UpdateProfileInteractor,
    private readonly listUsersInteractor: ListUsersInteractor,
    private readonly updateUserInteractor: UpdateUserInteractor,
  ) {}

  async getCurrentUser(userId: string): Promise<UserResponse> {
    return this.getCurrentUserInteractor.execute(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponse> {
    return this.updateProfileInteractor.execute({ userId, dto });
  }

  async listUsers(query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.listUsersInteractor.execute({ query });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<UserResponse> {
    return this.updateUserInteractor.execute({ userId, dto });
  }
}
