import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { createFeatureFlagsStrategy } from "@/modules/feature-flags/feature-flags.factory";
import { PostHogFeatureFlagsStrategy } from "@/modules/feature-flags/strategies/posthog-feature-flags.strategy";

describe("createFeatureFlagsStrategy", () => {
  it("returns PostHogFeatureFlagsStrategy when POSTHOG_API_KEY is set", () => {
    const configService = mockDeep<ConfigService>();
    configService.get.mockImplementation((key) => {
      if (key === "POSTHOG_API_KEY") {
        return "phc_test";
      }
      if (key === "POSTHOG_HOST") {
        return "https://us.i.posthog.com";
      }
      return undefined;
    });

    const strategy = createFeatureFlagsStrategy(configService);

    expect(strategy).toBeInstanceOf(PostHogFeatureFlagsStrategy);
  });

  it("returns null and logs a warning when POSTHOG_API_KEY is missing", () => {
    const warnSpy = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    const configService = mockDeep<ConfigService>();
    configService.get.mockReturnValue(undefined);

    const strategy = createFeatureFlagsStrategy(configService);

    expect(strategy).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "POSTHOG_API_KEY is not set — feature flag evaluation is disabled until configured",
    );

    warnSpy.mockRestore();
  });
});
