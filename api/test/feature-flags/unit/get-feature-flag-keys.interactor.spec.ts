import { describe, expect, it } from "vitest";

import { EFeatureFlagKey } from "@/modules/feature-flags/feature-flags.enums";
import { FeatureFlagsSerializer } from "@/modules/feature-flags/feature-flags.serializer";
import { GetFeatureFlagKeysInteractor } from "@/modules/feature-flags/interactors/get-feature-flag-keys.interactor";

describe("GetFeatureFlagKeysInteractor", () => {
  it("returns all declared feature flag keys", async () => {
    const interactor = new GetFeatureFlagKeysInteractor(new FeatureFlagsSerializer());

    const result = await interactor.execute();

    expect(result.keys).toEqual([EFeatureFlagKey.HEALTH_CHECK]);
  });
});
