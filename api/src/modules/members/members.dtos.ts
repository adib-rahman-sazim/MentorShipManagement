import { ApiProperty } from "@nestjs/swagger";

import { ArrayNotEmpty, IsArray, IsEnum, IsString } from "class-validator";

import { EUserRole } from "@/common/enums/roles.enums";

export class UpdateMemberRoleDto {
  @IsString()
  userId!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole", isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(EUserRole, { each: true })
  roleSlugs!: EUserRole[];
}

export class UpdateSystemRolesDto {
  @IsString()
  userId!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole", isArray: true })
  @IsArray()
  @IsEnum(EUserRole, { each: true })
  roleSlugs!: EUserRole[];
}
