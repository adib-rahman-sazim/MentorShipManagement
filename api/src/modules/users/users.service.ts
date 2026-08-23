import { Injectable } from "@nestjs/common";

import type { EUserRole } from "@/common/enums/roles.enums";

import { CreateUserInteractor } from "./interactors/create-user.interactor";
import { DeleteUserInteractor } from "./interactors/delete-user.interactor";
import { GetUserInteractor } from "./interactors/get-user.interactor";
import { ListUsersInteractor } from "./interactors/list-users.interactor";
import { UpdateProfileInteractor } from "./interactors/update-profile.interactor";
import { UpdateUserInteractor } from "./interactors/update-user.interactor";
import type {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
} from "./users.dtos";
import type { PaginatedUsersResponse, UserResponse } from "./users.responses";

@Injectable()
export class UsersService {
  constructor(
    private readonly getUserInteractor: GetUserInteractor,
    private readonly updateProfileInteractor: UpdateProfileInteractor,
    private readonly listUsersInteractor: ListUsersInteractor,
    private readonly updateUserInteractor: UpdateUserInteractor,
    private readonly createUserInteractor: CreateUserInteractor,
    private readonly deleteUserInteractor: DeleteUserInteractor,
  ) {}

  async getCurrentUser(userId: string): Promise<UserResponse> {
    return this.getUserInteractor.execute(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponse> {
    return this.updateProfileInteractor.execute({ userId, dto });
  }

  async listUsers(query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.listUsersInteractor.execute({ query });
  }

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    actorRole: EUserRole,
  ): Promise<UserResponse> {
    return this.updateUserInteractor.execute({ userId, dto, actorRole });
  }

  async createUser(dto: CreateUserDto, actorRole: EUserRole): Promise<UserResponse> {
    return this.createUserInteractor.execute({ dto, actorRole });
  }

  async getUserById(userId: string): Promise<UserResponse> {
    return this.getUserInteractor.execute(userId);
  }

  async deleteUser(userId: string, actorId: string): Promise<void> {
    return this.deleteUserInteractor.execute({ userId, actorId });
  }
}
