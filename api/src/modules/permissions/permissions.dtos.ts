import { ApiProperty } from "@nestjs/swagger";

import { Type } from "class-transformer";
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";

import { EUserRole } from "@/common/enums/roles.enums";
import { AbstractApiResponse } from "@/common/interceptors/response-transform.interceptor.responses";

import { OVERRIDE_REASON_MAX_LENGTH } from "./permissions.constants";
import {
  EPermission,
  EPermissionCode,
  EPermissionOverrideEffect,
  EPermissionSource,
  EResource,
} from "./permissions.enums";

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

export class UserPermissionOverrideDto {
  @ApiProperty({ enum: EPermissionCode, enumName: "EPermissionCode" })
  @IsEnum(EPermissionCode)
  permissionCode!: EPermissionCode;

  @ApiProperty({ enum: EPermissionOverrideEffect, enumName: "EPermissionOverrideEffect" })
  @IsEnum(EPermissionOverrideEffect)
  effect!: EPermissionOverrideEffect;
}

export class ReplaceUserPermissionOverridesDto {
  @ApiProperty({ type: [UserPermissionOverrideDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionOverrideDto)
  overrides!: UserPermissionOverrideDto[];

  @ApiProperty({ required: false, maxLength: OVERRIDE_REASON_MAX_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(OVERRIDE_REASON_MAX_LENGTH)
  reason?: string;
}

export class UserPermissionEntryResponse {
  @ApiProperty({ enum: EPermissionCode, enumName: "EPermissionCode" })
  code!: EPermissionCode;

  @ApiProperty({ enum: EResource, enumName: "EResource" })
  resource!: EResource;

  @ApiProperty({ enum: EPermission, enumName: "EPermission" })
  action!: EPermission;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: EPermissionSource, enumName: "EPermissionSource" })
  source!: EPermissionSource;

  @ApiProperty()
  effective!: boolean;

  @ApiProperty()
  roleDefault!: boolean;
}

export class UserPermissionOverridesResponse {
  @ApiProperty({ format: "uuid" })
  userId!: string;

  @ApiProperty({ enum: EUserRole, enumName: "EUserRole" })
  role!: EUserRole;

  @ApiProperty()
  editable!: boolean;

  @ApiProperty({ type: [UserPermissionEntryResponse] })
  permissions!: UserPermissionEntryResponse[];
}

export class UserPermissionOverridesApiResponse extends AbstractApiResponse {
  @ApiProperty({ type: UserPermissionOverridesResponse })
  data!: UserPermissionOverridesResponse;
}
