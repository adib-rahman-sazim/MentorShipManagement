import { ApiProperty } from "@nestjs/swagger";

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";

import { PaginationArgsDto } from "@/common/dtos/pagination.dtos";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { USER_PASSWORD_MAX_LENGTH, USER_PASSWORD_MIN_LENGTH } from "./users.constants";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(USER_PASSWORD_MIN_LENGTH)
  @MaxLength(USER_PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  @IsEnum(EUserRole)
  role!: EUserRole;

  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiProperty({ enum: EUserState, enumName: "EUserState", required: false })
  @IsOptional()
  @IsEnum(EUserState)
  state?: EUserState;
}

export class UpdateUserDto {
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

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole", required: false })
  @IsOptional()
  @IsEnum(EUserRole)
  role?: EUserRole;
}

export class ListUsersQueryDto extends PaginationArgsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: EUserState, enumName: "EUserState", required: false })
  @IsOptional()
  @IsEnum(EUserState)
  state?: EUserState;
}
