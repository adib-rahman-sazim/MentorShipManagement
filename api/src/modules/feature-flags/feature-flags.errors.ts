export class FeatureFlagsNotConfiguredError extends Error {
  constructor() {
    super(
      "Feature flags are not configured. Set POSTHOG_API_KEY to enable feature flag evaluation.",
    );
    this.name = "FeatureFlagsNotConfiguredError";
  }
}
