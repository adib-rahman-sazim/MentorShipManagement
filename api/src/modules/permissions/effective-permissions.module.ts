import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Permission } from "@/common/entities/permissions.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";

import { EffectivePermissionsService } from "./effective-permissions.service";

@Module({
  imports: [MikroOrmModule.forFeature([Permission, RolePermission, UserPermissionOverride])],
  providers: [EffectivePermissionsService],
  exports: [EffectivePermissionsService],
})
export class EffectivePermissionsModule {}
