import { PostHog } from "posthog-node";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PostHogFeatureFlagsStrategy } from "@/modules/feature-flags/strategies/posthog-feature-flags.strategy";

vi.mock("posthog-node", () => ({
  PostHog: vi.fn(),
}));

describe("PostHogFeatureFlagsStrategy", () => {
  let client: {
    isFeatureEnabled: ReturnType<typeof vi.fn>;
    shutdown: ReturnType<typeof vi.fn>;
  };
  let strategy: PostHogFeatureFlagsStrategy;

  beforeEach(() => {
    client = {
      isFeatureEnabled: vi.fn(),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(PostHog).mockImplementation(() => client as unknown as PostHog);

    strategy = new PostHogFeatureFlagsStrategy({
      apiKey: "phc_test",
      host: "https://eu.i.posthog.com",
    });
  });

  it("instantiates the PostHog client with the supplied host", () => {
    expect(PostHog).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({ host: "https://eu.i.posthog.com" }),
    );
  });

  it("isEnabled forwards arguments and returns the resolved boolean", async () => {
    client.isFeatureEnabled.mockResolvedValue(true);
    expect(
      await strategy.isEnabled("flag", "user-1", { personProperties: { role: "expert" } }),
    ).toBe(true);
    expect(client.isFeatureEnabled).toHaveBeenCalledWith("flag", "user-1", {
      personProperties: { role: "expert" },
    });
  });

  it("isEnabled returns false when PostHog returns null", async () => {
    client.isFeatureEnabled.mockResolvedValue(null);
    expect(await strategy.isEnabled("flag", "user-1")).toBe(false);
  });

  it("isEnabled returns false when PostHog throws", async () => {
    client.isFeatureEnabled.mockRejectedValue(new Error("boom"));
    expect(await strategy.isEnabled("flag", "user-1")).toBe(false);
  });

  it("shutdown delegates to the PostHog client", async () => {
    await strategy.shutdown();
    expect(client.shutdown).toHaveBeenCalled();
  });
});
