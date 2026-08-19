import { ApiProperty } from "@nestjs/swagger";

import { EFeatureFlagKey } from "./feature-flags.enums";

export class FeatureFlagKeysResponse {
  @ApiProperty({ enum: EFeatureFlagKey, enumName: "EFeatureFlagKey", isArray: true })
  keys!: EFeatureFlagKey[];
}
