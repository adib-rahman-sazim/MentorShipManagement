import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";

import { EUserRole } from "@/common/enums/roles.enums";

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  @IsEnum(EUserRole)
  role!: EUserRole;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}

export class ListInvitationsQueryDto {
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
  status?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}

export class ValidateSystemInvitationQueryDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ValidateOrganizationInvitationQueryDto {
  @IsUUID()
  id!: string;
}
