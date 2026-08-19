export interface IFeatureFlagIdentifyProperties {
  email?: string;
  organizationId?: string | null;
  role?: string | null;
}

export interface IFeatureFlagsStrategy {
  init(): void;
  identify(distinctId: string, properties?: IFeatureFlagIdentifyProperties): void;
  reset(): void;
  isEnabled(flagKey: string): boolean;
  subscribe(callback: () => void): () => void;
}
