import { createElement } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeatureFlagsContext } from "../FeatureFlagsProvider.context";
import { FeatureFlagsNotConfiguredError } from "../FeatureFlagsProvider.errors";
import { useFeatureFlag } from "../hooks/useFeatureFlag.hook";
import { IFeatureFlagsStrategy } from "../strategies/strategy.interfaces";

const buildStrategy = (
  flags: Record<string, boolean> = {},
  overrides: Partial<IFeatureFlagsStrategy> = {},
): IFeatureFlagsStrategy => ({
  init: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  isEnabled: (key) => flags[key] ?? false,
  subscribe: vi.fn(() => () => undefined),
  ...overrides,
});

const renderWithStrategy = (strategy: IFeatureFlagsStrategy | null, flagKey: string) =>
  renderHook(() => useFeatureFlag(flagKey), {
    wrapper: ({ children }) =>
      createElement(FeatureFlagsContext.Provider, { value: strategy }, children),
  });

describe("useFeatureFlag", () => {
  it("returns true when the strategy reports the flag as enabled", () => {
    const { result } = renderWithStrategy(buildStrategy({ "my-flag": true }), "my-flag");
    expect(result.current).toBe(true);
  });

  it("returns false when the strategy reports the flag as disabled", () => {
    const { result } = renderWithStrategy(buildStrategy({ "my-flag": false }), "my-flag");
    expect(result.current).toBe(false);
  });

  it("throws FeatureFlagsNotConfiguredError when strategy is null", () => {
    expect(() => renderWithStrategy(null, "my-flag")).toThrow(FeatureFlagsNotConfiguredError);
  });
});
