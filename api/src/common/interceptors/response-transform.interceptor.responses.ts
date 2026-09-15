import { ApiProperty } from "@nestjs/swagger";

export abstract class AbstractApiResponse {
  @ApiProperty()
  statusCode!: number;

  @ApiProperty()
  message!: string;
}
