import { Global, Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { EffectivePermissionsModule } from "@/modules/permissions/effective-permissions.module";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([Mentorship]), EffectivePermissionsModule, RedisModule],
  providers: [CaslAbilityFactory, CaslCacheService],
  exports: [CaslAbilityFactory, CaslCacheService],
})
export class CaslModule {}
