import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import {
  CreateOrganizationDto,
  ListOrganizationMembersQueryDto,
  ListOrganizationsQueryDto,
} from "./organizations.dtos";
import type {
  OrganizationResponse,
  PaginatedOrganizationMembersResponse,
  PaginatedOrganizationsResponse,
} from "./organizations.responses";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
@UseInterceptors(ResponseTransformInterceptor)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.ORGANIZATION, EPermission.CREATE)])
  createOrganization(
    @Body() dto: CreateOrganizationDto,
    @Req() req: Request,
  ): Promise<OrganizationResponse> {
    const roles = (req.user?.roles ?? []) as EUserRole[];
    return this.organizationsService.create(dto, req.user!.id, roles);
  }

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.ORGANIZATION, EPermission.LIST)])
  listOrganizations(
    @Query() query: ListOrganizationsQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedOrganizationsResponse> {
    const roles = (req.user?.roles ?? []) as EUserRole[];
    return this.organizationsService.list(query, req.user!.id, roles);
  }

  @Get(":id/members")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.MEMBER, EPermission.LIST)], {
    requireActiveOrganization: true,
  })
  listMembers(
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ListOrganizationMembersQueryDto,
  ): Promise<PaginatedOrganizationMembersResponse> {
    return this.organizationsService.listMembers(id, query);
  }
}
