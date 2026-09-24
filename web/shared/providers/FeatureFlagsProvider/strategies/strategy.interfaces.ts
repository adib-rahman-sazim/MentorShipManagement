export interface IFeatureFlagIdentifyProperties {
  email?: string;
  role?: string | null;
}

export interface IFeatureFlagsStrategy {
  init(): void;
  identify(distinctId: string, properties?: IFeatureFlagIdentifyProperties): void;
  reset(): void;
  isEnabled(flagKey: string): boolean;
  subscribe(callback: () => void): () => void;
}
