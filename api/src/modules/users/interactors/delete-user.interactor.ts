import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";

import { USER_ERROR_MESSAGES } from "../users.constants";
import type { IDeleteUserContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";

@Injectable()
export class DeleteUserInteractor implements IBaseInteractor<IDeleteUserContext, void> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({ userId, actorId }: IDeleteUserContext): Promise<void> {
    if (userId === actorId) {
      throw new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_DELETE_SELF);
    }

    
    await this.usersRepository.transactional(async (em) => {
      const user = await this.usersRepository.findById(userId, em);

      if (!user) {
        throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      this.usersRepository.softDelete(user);
      await this.usersRepository.deleteSessionsForUser(userId, em);
    });

    await this.caslCacheService.invalidateUser(userId);
  }
}
