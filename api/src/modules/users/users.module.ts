import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";

import { AuthModule } from "../auth/auth.module";
import { CreateUserInteractor } from "./interactors/create-user.interactor";
import { DeleteUserInteractor } from "./interactors/delete-user.interactor";
import { GetUserInteractor } from "./interactors/get-user.interactor";
import { ListUsersInteractor } from "./interactors/list-users.interactor";
import { UpdateProfileInteractor } from "./interactors/update-profile.interactor";
import { UpdateUserInteractor } from "./interactors/update-user.interactor";
import { UsersController } from "./users.controller";
import { UsersSerializer } from "./users.serializer";
import { UsersService } from "./users.service";

@Module({
  imports: [MikroOrmModule.forFeature([User, Account, Role]), AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    GetUserInteractor,
    UpdateProfileInteractor,
    ListUsersInteractor,
    UpdateUserInteractor,
    CreateUserInteractor,
    DeleteUserInteractor,
    UsersSerializer,
  ],
  exports: [UsersService],
})
export class UsersModule {}
