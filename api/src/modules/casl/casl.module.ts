import { Global, Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";
import { Mentorship } from "@/common/entities/mentorships.entity";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Mentorship,Permission, Role, RolePermission, UserPermissionOverride]),
    RedisModule,
  ],
  providers: [CaslAbilityFactory, CaslCacheService, EffectivePermissionsService],
  exports: [CaslAbilityFactory, CaslCacheService, MikroOrmModule, EffectivePermissionsService],
})
export class CaslModule {}
