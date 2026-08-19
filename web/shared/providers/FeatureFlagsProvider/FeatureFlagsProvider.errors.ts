export class FeatureFlagsNotConfiguredError extends Error {
  constructor() {
    super(
      "Feature flags are not configured. Set NEXT_PUBLIC_POSTHOG_KEY to enable feature flag evaluation.",
    );
    this.name = "FeatureFlagsNotConfiguredError";
  }
}
