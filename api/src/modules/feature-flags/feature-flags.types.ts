export type TFeatureFlagOptions = {
  groups?: Record<string, string>;
  personProperties?: Record<string, string>;
  groupProperties?: Record<string, Record<string, string>>;
};
