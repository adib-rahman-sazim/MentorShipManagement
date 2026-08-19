import { forwardRef, Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { User } from "@/common/entities/users.entity";
import { InvitationsModule } from "@/modules/invitations/invitations.module";

import { AuthModule } from "../auth/auth.module";
import { GetCurrentUserInteractor } from "./interactors/get-current-user.interactor";
import { InviteUserInteractor } from "./interactors/invite-user.interactor";
import { ListUsersInteractor } from "./interactors/list-users.interactor";
import { UpdateProfileInteractor } from "./interactors/update-profile.interactor";
import { UpdateUserInteractor } from "./interactors/update-user.interactor";
import { UsersController } from "./users.controller";
import { UsersSerializer } from "./users.serializer";
import { UsersService } from "./users.service";

@Module({
  imports: [MikroOrmModule.forFeature([User]), AuthModule, forwardRef(() => InvitationsModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    GetCurrentUserInteractor,
    UpdateProfileInteractor,
    ListUsersInteractor,
    UpdateUserInteractor,
    InviteUserInteractor,
    UsersSerializer,
  ],
  exports: [UsersService],
})
export class UsersModule {}
