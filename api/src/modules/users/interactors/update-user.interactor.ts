import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { RolesRepository } from "@/modules/permissions/roles.repository";

import { USER_ERROR_MESSAGES } from "../users.constants";
import type { IUpdateUserContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import type { UserResponse } from "../users.responses";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class UpdateUserInteractor implements IBaseInteractor<IUpdateUserContext, UserResponse> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly usersSerializer: UsersSerializer,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({ userId, dto }: IUpdateUserContext): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.image !== undefined) {
      user.image = dto.image;
    }
    if (dto.state !== undefined) {
      user.state = dto.state;
    }

    let isRoleChanging = false;

    if (dto.role !== undefined && dto.role !== user.role.code) {
      const role = await this.rolesRepository.findByCode(dto.role);

      if (!role) {
        throw new NotFoundException(USER_ERROR_MESSAGES.ROLE_NOT_FOUND);
      }

      user.role = role;
      isRoleChanging = true;
    }

    await this.usersRepository.flush();

    if (isRoleChanging) {
      await this.caslCacheService.invalidateUser(userId);
    }

    return this.usersSerializer.serialize(user);
  }
}
