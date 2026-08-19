import { TFeatureFlagOptions } from "./feature-flags.types";

export interface IFeatureFlagsStrategy {
  isEnabled(flagKey: string, distinctId: string, options?: TFeatureFlagOptions): Promise<boolean>;

  shutdown(): Promise<void>;
}
