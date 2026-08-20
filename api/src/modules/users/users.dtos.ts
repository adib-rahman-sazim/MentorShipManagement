import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsPositive, IsString, IsUrl, Min } from "class-validator";

import { EUserState } from "@/common/enums/users.enums";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({ enum: EUserState, enumName: "EUserState", required: false })
  @IsOptional()
  @IsEnum(EUserState)
  state?: EUserState;
}

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: EUserState, enumName: "EUserState", required: false })
  @IsOptional()
  @IsEnum(EUserState)
  state?: EUserState;
}
