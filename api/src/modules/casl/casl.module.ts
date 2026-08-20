import { Global, Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Permission, Role, RolePermission]), RedisModule],
  providers: [CaslAbilityFactory, CaslCacheService],
  exports: [CaslAbilityFactory, CaslCacheService, MikroOrmModule],
})
export class CaslModule {}
