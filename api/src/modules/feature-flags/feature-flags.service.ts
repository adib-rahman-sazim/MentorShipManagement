import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";

import { FEATURE_FLAGS_STRATEGY } from "./feature-flags.constants";
import { FeatureFlagsNotConfiguredError } from "./feature-flags.errors";
import type { IFeatureFlagsStrategy } from "./feature-flags.interfaces";
import type { TFeatureFlagOptions } from "./feature-flags.types";

@Injectable()
export class FeatureFlagsService implements OnModuleDestroy {
  constructor(
    @Inject(FEATURE_FLAGS_STRATEGY)
    private readonly strategy: IFeatureFlagsStrategy | null,
  ) {}

  isEnabled(flagKey: string, distinctId: string, options?: TFeatureFlagOptions): Promise<boolean> {
    if (!this.strategy) {
      throw new FeatureFlagsNotConfiguredError();
    }

    return this.strategy.isEnabled(flagKey, distinctId, options);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.strategy) {
      return;
    }

    await this.strategy.shutdown();
  }
}
