import { Injectable, NotFoundException } from "@nestjs/common";

import type { User } from "@/common/entities/users.entity";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { USER_ERROR_MESSAGES } from "../users.constants";
import type { IUpdateProfileContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import type { UserResponse } from "../users.responses";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class UpdateProfileInteractor
  implements IBaseInteractor<IUpdateProfileContext, UserResponse>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  async execute({ userId, dto }: IUpdateProfileContext): Promise<UserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const updateData: Partial<User> = {};
    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.image !== undefined) {
      updateData.image = dto.image;
    }

    const updatedUser = await this.usersRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    await this.usersRepository.flush();
    return this.usersSerializer.serialize(updatedUser);
  }
}
