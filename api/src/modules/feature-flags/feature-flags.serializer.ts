import { Injectable } from "@nestjs/common";

import { EFeatureFlagKey } from "./feature-flags.enums";
import type { FeatureFlagKeysResponse } from "./feature-flags.responses";

@Injectable()
export class FeatureFlagsSerializer {
  serializeKeys(): FeatureFlagKeysResponse {
    return { keys: Object.values(EFeatureFlagKey) };
  }
}
