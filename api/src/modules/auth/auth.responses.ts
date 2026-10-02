import { ApiProperty } from "@nestjs/swagger";

import { EAuthErrorCode } from "./auth.enums";

export class AuthErrorResponse {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  message!: string;

  @ApiProperty({ type: [Object] })
  errors!: unknown[];

  @ApiProperty({ enum: EAuthErrorCode, enumName: "EAuthErrorCode", required: false })
  errorCode?: EAuthErrorCode;
}
