import { Logger } from "@nestjs/common";

import { PostHog } from "posthog-node";

import {
  POSTHOG_FEATURE_FLAGS_POLLING_INTERVAL_MS,
  POSTHOG_FLUSH_AT,
  POSTHOG_FLUSH_INTERVAL_MS,
} from "../feature-flags.constants";
import { IFeatureFlagsStrategy } from "../feature-flags.interfaces";
import { TFeatureFlagOptions } from "../feature-flags.types";

export class PostHogFeatureFlagsStrategy implements IFeatureFlagsStrategy {
  private readonly logger = new Logger(PostHogFeatureFlagsStrategy.name);
  private readonly client: PostHog;

  constructor({ apiKey, host }: { apiKey: string; host: string }) {
    this.client = new PostHog(apiKey, {
      host,
      flushAt: POSTHOG_FLUSH_AT,
      flushInterval: POSTHOG_FLUSH_INTERVAL_MS,
      featureFlagsPollingInterval: POSTHOG_FEATURE_FLAGS_POLLING_INTERVAL_MS,
    });
  }

  async isEnabled(
    flagKey: string,
    distinctId: string,
    options: TFeatureFlagOptions = {},
  ): Promise<boolean> {
    try {
      const result = await this.client.isFeatureEnabled(flagKey, distinctId, options);
      return result ?? false;
    } catch (error) {
      this.logger.error(`Failed to evaluate feature flag "${flagKey}": ${error}`);
      return false;
    }
  }

  async shutdown(): Promise<void> {
    await this.client.shutdown();
  }
}
