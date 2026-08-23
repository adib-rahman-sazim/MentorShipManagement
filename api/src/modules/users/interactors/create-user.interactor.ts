import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { UniqueConstraintViolationException } from "@mikro-orm/core";

import { hashPassword } from "better-auth/crypto";

import type { Role } from "@/common/entities/roles.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserState } from "@/common/enums/users.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { RolesRepository } from "@/modules/permissions/roles.repository";

import { AccountsRepository } from "../accounts.repository";
import { USER_ERROR_MESSAGES } from "../users.constants";
import type { CreateUserDto } from "../users.dtos";
import type { ICreateUserContext } from "../users.interfaces";
import { UsersRepository } from "../users.repository";
import type { UserResponse } from "../users.responses";
import { UsersSerializer } from "../users.serializer";

@Injectable()
export class CreateUserInteractor implements IBaseInteractor<ICreateUserContext, UserResponse> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly accountsRepository: AccountsRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly usersSerializer: UsersSerializer,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({ dto }: ICreateUserContext): Promise<UserResponse> {
    const role = await this.rolesRepository.findByCode(dto.role);

    if (!role) {
      throw new NotFoundException(USER_ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    const existingUser = await this.usersRepository.findByEmailIncludingDeleted(dto.email);

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictException(USER_ERROR_MESSAGES.EMAIL_ALREADY_IN_USE);
    }

    const hashedPassword = await hashPassword(dto.password);

    let user: User;

    try {
      user = existingUser
        ? await this.reactivate(existingUser, dto, role, hashedPassword)
        : await this.provision(dto, role, hashedPassword);
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(USER_ERROR_MESSAGES.EMAIL_ALREADY_IN_USE);
      }

      throw error;
    }

    if (existingUser) {
      await this.caslCacheService.invalidateUser(user.id);
    }

    return this.usersSerializer.serialize(user);
  }

 
  private provision(dto: CreateUserDto, role: Role, hashedPassword: string): Promise<User> {
    return this.usersRepository.transactional(async (em) => {
      const user = this.usersRepository.createUser(
        {
          email: dto.email,
          name: dto.name,
          image: dto.image,
          role,
          state: dto.state ?? EUserState.ACTIVE,
          emailVerified: true,
        },
        em,
      );

      await em.flush();

      this.accountsRepository.createCredentialAccount(user, hashedPassword, em);

      return user;
    });
  }

  private async reactivate(
    user: User,
    dto: CreateUserDto,
    role: Role,
    hashedPassword: string,
  ): Promise<User> {
    user.deletedAt = null;
    user.name = dto.name;
    user.image = dto.image;
    user.role = role;
    user.state = dto.state ?? EUserState.ACTIVE;
    user.emailVerified = true;

    const account = await this.accountsRepository.findCredentialAccount(user);

    if (account) {
      account.password = hashedPassword;
    } else {
      this.accountsRepository.createCredentialAccount(user, hashedPassword);
    }

    await this.usersRepository.flush();

    return user;
  }
}
