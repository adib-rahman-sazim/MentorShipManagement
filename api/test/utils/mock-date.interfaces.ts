export interface IMockDateSetup {
  reset(): void;
  set(options: { offset?: number; isoDate?: string }): void;
}
