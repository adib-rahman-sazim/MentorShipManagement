import { POSTHOG_HOST, POSTHOG_KEY } from "@/shared/constants/env.constants";

import { POSTHOG_DEFAULT_HOST } from "./feature-flags.constants";
import { PostHogStrategy } from "./strategies/posthog/posthog.strategy";
import { IFeatureFlagsStrategy } from "./strategies/strategy.interfaces";

export const createFeatureFlagsStrategy = (): IFeatureFlagsStrategy | null => {
  if (POSTHOG_KEY) {
    return new PostHogStrategy({
      apiKey: POSTHOG_KEY,
      apiHost: POSTHOG_HOST ?? POSTHOG_DEFAULT_HOST,
    });
  }

  console.warn(
    "NEXT_PUBLIC_POSTHOG_KEY is not set — feature flag evaluation is disabled until configured",
  );

  return null;
};
