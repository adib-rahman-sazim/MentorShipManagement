import { Global, Module, type OnModuleInit } from "@nestjs/common";

import { MentorshipsModule } from "@/modules/mentorships/mentorships.module";
import { EffectivePermissionsModule } from "@/modules/permissions/effective-permissions.module";
import { RedisModule } from "@/modules/redis/redis.module";

import { CaslAbilityFactory } from "./casl.ability-factory";
import { CaslCacheService } from "./casl-cache.service";
import { assertContextualPoliciesComplete } from "@/modules/permissions/policy-resolution.helpers";

@Global()
@Module({
  imports: [EffectivePermissionsModule, MentorshipsModule, RedisModule],
  providers: [CaslAbilityFactory, CaslCacheService],
  exports: [CaslAbilityFactory, CaslCacheService],
})
export class CaslModule implements OnModuleInit {
  onModuleInit(): void {
    assertContextualPoliciesComplete();
  }
}
