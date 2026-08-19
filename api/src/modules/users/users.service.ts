import { Injectable } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";

import { GetCurrentUserInteractor } from "./interactors/get-current-user.interactor";
import { InviteUserInteractor } from "./interactors/invite-user.interactor";
import { ListUsersInteractor } from "./interactors/list-users.interactor";
import { UpdateProfileInteractor } from "./interactors/update-profile.interactor";
import { UpdateUserInteractor } from "./interactors/update-user.interactor";
import type {
  InviteUserDto,
  ListUsersQueryDto,
  UpdateProfileDto,
  UpdateUserDto,
} from "./users.dtos";
import type {
  IInviteUserResponse,
  IPaginatedUsersResponse,
  IUserResponse,
} from "./users.interfaces";

@Injectable()
export class UsersService {
  constructor(
    private readonly getCurrentUserInteractor: GetCurrentUserInteractor,
    private readonly updateProfileInteractor: UpdateProfileInteractor,
    private readonly listUsersInteractor: ListUsersInteractor,
    private readonly updateUserInteractor: UpdateUserInteractor,
    private readonly inviteUserInteractor: InviteUserInteractor,
  ) {}

  async getCurrentUser(userId: string): Promise<IUserResponse> {
    return this.getCurrentUserInteractor.execute(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<IUserResponse> {
    return this.updateProfileInteractor.execute({ userId, dto });
  }

  async listUsers(
    query: ListUsersQueryDto,
    organizationId: string,
  ): Promise<IPaginatedUsersResponse> {
    return this.listUsersInteractor.execute({ query, organizationId });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<IUserResponse> {
    return this.updateUserInteractor.execute({ userId, dto });
  }

  async inviteUser(
    dto: InviteUserDto,
    organizationId: string,
    inviter: {
      id: string;
      email: string;
      roles: EUserRole[];
    },
    inviterHeaders: Headers,
  ): Promise<IInviteUserResponse> {
    return this.inviteUserInteractor.execute({ dto, organizationId, inviter, inviterHeaders });
  }
}
