import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { FEATURE_FLAGS_STRATEGY } from "./feature-flags.constants";
import { FeatureFlagsController } from "./feature-flags.controller";
import { createFeatureFlagsStrategy } from "./feature-flags.factory";
import { FeatureFlagsSerializer } from "./feature-flags.serializer";
import { FeatureFlagsService } from "./feature-flags.service";
import { GetFeatureFlagKeysInteractor } from "./interactors/get-feature-flag-keys.interactor";

@Global()
@Module({
  controllers: [FeatureFlagsController],
  providers: [
    {
      provide: FEATURE_FLAGS_STRATEGY,
      useFactory: createFeatureFlagsStrategy,
      inject: [ConfigService],
    },
    FeatureFlagsService,
    FeatureFlagsSerializer,
    GetFeatureFlagKeysInteractor,
  ],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
