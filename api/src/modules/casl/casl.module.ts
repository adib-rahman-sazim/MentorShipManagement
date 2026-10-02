import { Global, Module } from "@nestjs/common";

import { EffectivePermissionsModule } from "@/modules/permissions/effective-permissions.module";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";

@Global()
@Module({
  imports: [EffectivePermissionsModule, RedisModule],
  providers: [CaslAbilityFactory, CaslCacheService],
  exports: [CaslAbilityFactory, CaslCacheService],
})
export class CaslModule {}
