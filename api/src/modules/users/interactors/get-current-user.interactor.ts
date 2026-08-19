import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { USER_ERROR_MESSAGES } from "../users.constants";
import type { IUserResponse } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class GetCurrentUserInteractor implements IBaseInteractor<string, IUserResponse> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSerializer: UsersSerializer,
  ) {}

  async execute(userId: string): Promise<IUserResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return this.usersSerializer.serialize(user);
  }
}
