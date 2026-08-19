import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

import { PaginationArgsDto } from "@/common/dtos/pagination.dtos";

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lowercase alphanumeric with hyphens (e.g., my-organization)",
  })
  slug?: string;
}

export class ListOrganizationsQueryDto extends PaginationArgsDto {
  @IsOptional()
  @IsString()
  search?: string;
}

export class ListOrganizationMembersQueryDto extends PaginationArgsDto {}
