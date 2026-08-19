import { Injectable } from "@nestjs/common";

import type { FeatureFlagKeysResponse } from "../feature-flags.responses";
import { FeatureFlagsSerializer } from "../feature-flags.serializer";

@Injectable()
export class GetFeatureFlagKeysInteractor {
  constructor(private readonly featureFlagsSerializer: FeatureFlagsSerializer) {}

  async execute(): Promise<FeatureFlagKeysResponse> {
    return this.featureFlagsSerializer.serializeKeys();
  }
}
