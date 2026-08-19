import posthog from "posthog-js";

import { EFeatureFlagKey } from "@/shared/typedefs/api";

import { IFeatureFlagIdentifyProperties, IFeatureFlagsStrategy } from "../strategy.interfaces";
import { POSTHOG_INIT_OPTIONS } from "./posthog.constants";
import { IPostHogStrategyConfig } from "./posthog.strategy.interfaces";

export class PostHogStrategy implements IFeatureFlagsStrategy {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private hasInitialized = false;
  private hasLoggedHealthCheck = false;

  constructor(config: IPostHogStrategyConfig) {
    this.apiKey = config.apiKey;
    this.apiHost = config.apiHost;
  }

  init(): void {
    if (this.hasInitialized || typeof window === "undefined") {
      return;
    }

    posthog.init(this.apiKey, {
      api_host: this.apiHost,
      ...POSTHOG_INIT_OPTIONS,
    });

    this.hasInitialized = true;

    posthog.onFeatureFlags(() => this.logHealthCheckIfEnabled());
  }

  private logHealthCheckIfEnabled(): void {
    if (this.hasLoggedHealthCheck) {
      return;
    }
    if (posthog.isFeatureEnabled(EFeatureFlagKey.HEALTH_CHECK) !== true) {
      return;
    }

    this.hasLoggedHealthCheck = true;
    console.log("feature flags service is healthy");
  }

  identify(distinctId: string, properties?: IFeatureFlagIdentifyProperties): void {
    if (!this.hasInitialized) {
      return;
    }
    posthog.identify(distinctId, properties as Record<string, unknown> | undefined);
  }

  reset(): void {
    if (!this.hasInitialized) {
      return;
    }
    posthog.reset();
  }

  isEnabled(flagKey: string): boolean {
    if (!this.hasInitialized) {
      return false;
    }
    return posthog.isFeatureEnabled(flagKey) ?? false;
  }

  subscribe(callback: () => void): () => void {
    if (!this.hasInitialized) {
      return () => undefined;
    }
    return posthog.onFeatureFlags(callback);
  }
}
