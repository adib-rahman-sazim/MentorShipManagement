import { ApiProperty } from "@nestjs/swagger";

import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

export class UserResponse {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "email" })
  email!: string;

  @ApiProperty()
  emailVerified!: boolean;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ enum: EUserState, enumName: "EUserState" })
  state!: EUserState;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginationMetaResponse {
  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [UserResponse] })
  data!: UserResponse[];

  @ApiProperty({ type: PaginationMetaResponse })
  meta!: PaginationMetaResponse;
}
