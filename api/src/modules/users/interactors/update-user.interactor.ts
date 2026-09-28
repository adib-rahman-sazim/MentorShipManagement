import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { EUserState } from "@/common/enums/users.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { RolesRepository } from "@/modules/permissions/roles.repository";

import { USER_ERROR_MESSAGES } from "../users.constants";
import type { IUpdateUserContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import type { UserResponse } from "../users.responses";
import { UsersSerializer } from "../users.serializer";
import {
  assertActorCanAssignRole,
  assertNoActiveMentorships,
  assertNotSuperadmin,
  assertSuperadminNotDemoted,
} from "../users-role-assignment.helpers";
import { UsersRoleAssignmentService } from "../users-role-assignment.service";

@Injectable()
export class UpdateUserInteractor implements IBaseInteractor<IUpdateUserContext, UserResponse> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly mentorshipsRepository: MentorshipsRepository,
    private readonly usersRoleAssignmentService: UsersRoleAssignmentService,
    private readonly usersSerializer: UsersSerializer,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({ userId, dto, actorRole, actorId }: IUpdateUserContext): Promise<UserResponse> {
    if (dto.state === EUserState.INACTIVE && userId === actorId) {
      throw new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_DEACTIVATE_SELF);
    }

    let isRoleChanging = false;
    let isDeactivating = false;

    const user = await this.usersRepository.transactional(async (em) => {
      const user = await this.usersRepository.findByIdForUpdate(userId, em);

      if (!user) {
        throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
      }

      assertNotSuperadmin(user.role.code);

      const targetRole = dto.role !== undefined && dto.role !== user.role.code ? dto.role : null;
      isDeactivating = dto.state === EUserState.INACTIVE && user.state !== EUserState.INACTIVE;

      if (targetRole !== null) {
        assertActorCanAssignRole(actorRole, targetRole);
        assertSuperadminNotDemoted(user.role.code, targetRole);
      }

      if (targetRole !== null || isDeactivating) {
        const hasActiveMentorship = await this.mentorshipsRepository.hasActiveMentorship(
          userId,
          em,
        );

        assertNoActiveMentorships(hasActiveMentorship);
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

      if (targetRole !== null) {
        await this.usersRoleAssignmentService.assertSuperadminSlotFree(targetRole, em, userId);

        const role = await this.rolesRepository.findByCode(targetRole, em);

        if (!role) {
          throw new NotFoundException(USER_ERROR_MESSAGES.ROLE_NOT_FOUND);
        }

        user.role = role;
        isRoleChanging = true;
      }

      if (isDeactivating) {
        await this.usersRepository.deleteSessionsForUser(userId, em);
      }

      return user;
    });

    if (isRoleChanging || isDeactivating) {
      await this.caslCacheService.invalidateUser(userId);
    }

    return this.usersSerializer.serialize(user);
  }
}
