import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { User } from "@/common/entities/users.entity";

import { AllManageHolderService } from "./all-manage-holder.service";
import { EffectivePermissionsModule } from "./effective-permissions.module";
import { GetMyCaslRulesInteractor } from "./interactors/get-my-casl-rules.interactor";
import { GetUserPermissionOverridesInteractor } from "./interactors/get-user-permission-overrides.interactor";
import { ReplaceUserPermissionOverridesInteractor } from "./interactors/replace-user-permission-overrides.interactor";
import { PermissionsController } from "./permissions.controller";
import { PermissionsSerializer } from "./permissions.serializer";

@Module({
  imports: [EffectivePermissionsModule, MikroOrmModule.forFeature([User])],
  controllers: [PermissionsController],
  providers: [
    GetMyCaslRulesInteractor,
    GetUserPermissionOverridesInteractor,
    ReplaceUserPermissionOverridesInteractor,
    PermissionsSerializer,
    AllManageHolderService,
  ],
})
export class PermissionsModule {}
