import { ApiProperty } from "@nestjs/swagger";

import { EPermission, EResource } from "./permissions.enums";

export class NormalizedCaslRuleResponse {
  @ApiProperty({ enum: EPermission, enumName: "EPermission", isArray: true })
  action!: EPermission[];

  @ApiProperty({ enum: EResource, enumName: "EResource", isArray: true })
  subject!: Array<EResource | "all">;

  @ApiProperty({ required: false })
  conditions?: Record<string, unknown>;

  @ApiProperty({ required: false })
  inverted?: boolean;

  @ApiProperty({ required: false })
  reason?: string;

  @ApiProperty({ required: false, type: [String] })
  fields?: string[];
}

export class GetMyCaslRulesResponse {
  @ApiProperty({ type: [NormalizedCaslRuleResponse] })
  rules!: NormalizedCaslRuleResponse[];
}
