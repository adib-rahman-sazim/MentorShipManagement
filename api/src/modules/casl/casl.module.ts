import { Global, Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { UserRolesService } from "@/modules/permissions/user-roles.service";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([Permission, Role, RolePermission, UserRole]),
    RedisModule,
  ],
  providers: [CaslAbilityFactory, CaslCacheService, UserRolesService],
  exports: [CaslAbilityFactory, CaslCacheService, UserRolesService, MikroOrmModule],
})
export class CaslModule {}
