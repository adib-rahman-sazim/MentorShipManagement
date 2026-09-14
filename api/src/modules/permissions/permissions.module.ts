import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Permission } from "@/common/entities/permissions.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { User } from "@/common/entities/users.entity";
import { CaslModule } from "@/modules/casl/casl.module";

import { AllManageHolderService } from "./all-manage-holder.service";
import { GetMyCaslRulesInteractor } from "./interactors/get-my-casl-rules.interactor";
import { GetUserPermissionOverridesInteractor } from "./interactors/get-user-permission-overrides.interactor";
import { ReplaceUserPermissionOverridesInteractor } from "./interactors/replace-user-permission-overrides.interactor";
import { PermissionsController } from "./permissions.controller";
import { PermissionsSerializer } from "./permissions.serializer";

@Module({
  imports: [
    CaslModule,
    MikroOrmModule.forFeature([User, Permission, RolePermission, UserPermissionOverride]),
  ],
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
