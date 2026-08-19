import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { POSTHOG_DEFAULT_HOST } from "./feature-flags.constants";
import { IFeatureFlagsStrategy } from "./feature-flags.interfaces";
import { PostHogFeatureFlagsStrategy } from "./strategies/posthog-feature-flags.strategy";

export const createFeatureFlagsStrategy = (
  configService: ConfigService,
): IFeatureFlagsStrategy | null => {
  const logger = new Logger("FeatureFlagsModule");
  const postHogApiKey = configService.get<string>("POSTHOG_API_KEY");

  if (postHogApiKey) {
    logger.log("Using PostHogFeatureFlagsStrategy");
    return new PostHogFeatureFlagsStrategy({
      apiKey: postHogApiKey,
      host: configService.get<string>("POSTHOG_HOST") ?? POSTHOG_DEFAULT_HOST,
    });
  }

  logger.warn("POSTHOG_API_KEY is not set — feature flag evaluation is disabled until configured");
  return null;
};
