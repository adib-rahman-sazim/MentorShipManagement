import { beforeEach, describe, expect, it } from "vitest";
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended";

import { FeatureFlagsNotConfiguredError } from "@/modules/feature-flags/feature-flags.errors";
import type { IFeatureFlagsStrategy } from "@/modules/feature-flags/feature-flags.interfaces";
import { FeatureFlagsService } from "@/modules/feature-flags/feature-flags.service";

describe("FeatureFlagsService", () => {
  let strategy: DeepMockProxy<IFeatureFlagsStrategy>;
  let service: FeatureFlagsService;

  beforeEach(() => {
    strategy = mockDeep<IFeatureFlagsStrategy>();
    service = new FeatureFlagsService(strategy);
  });

  it("delegates isEnabled to the strategy with the distinct id and options", async () => {
    strategy.isEnabled.mockResolvedValue(true);

    const result = await service.isEnabled("new-checkout", "user-1", {
      personProperties: { role: "expert" },
    });

    expect(result).toBe(true);
    expect(strategy.isEnabled).toHaveBeenCalledWith("new-checkout", "user-1", {
      personProperties: { role: "expert" },
    });
  });

  it("throws FeatureFlagsNotConfiguredError when strategy is null", () => {
    const unconfiguredService = new FeatureFlagsService(null);

    expect(() => unconfiguredService.isEnabled("my-flag", "user-1")).toThrow(
      FeatureFlagsNotConfiguredError,
    );
  });

  it("shuts the strategy down on module destroy", async () => {
    await service.onModuleDestroy();
    expect(strategy.shutdown).toHaveBeenCalled();
  });

  it("does not throw on module destroy when strategy is null", async () => {
    const unconfiguredService = new FeatureFlagsService(null);

    await expect(unconfiguredService.onModuleDestroy()).resolves.toBeUndefined();
  });
});
