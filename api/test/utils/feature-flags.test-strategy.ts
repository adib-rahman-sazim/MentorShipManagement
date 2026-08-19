import type { IFeatureFlagsStrategy } from "@/modules/feature-flags/feature-flags.interfaces";

/**
 * Test double for the feature flags strategy. Defaults every flag to enabled so
 * e2e tests exercise today's behavior; individual tests call `setFlag` to drive
 * the gated (disabled) branch and `reset` in `afterEach`.
 */
export class ControllableFeatureFlagsStrategy implements IFeatureFlagsStrategy {
  private readonly overrides = new Map<string, boolean>();

  setFlag(flagKey: string, value: boolean): void {
    this.overrides.set(flagKey, value);
  }

  reset(): void {
    this.overrides.clear();
  }

  async isEnabled(flagKey: string): Promise<boolean> {
    return this.overrides.get(flagKey) ?? true;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
