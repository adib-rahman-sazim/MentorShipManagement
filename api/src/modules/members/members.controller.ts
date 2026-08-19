import { Body, Controller, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { UpdateMemberRoleDto, UpdateSystemRolesDto } from "./members.dtos";
import type { IUpdateMemberRoleResponse } from "./members.interfaces";
import { MembersService } from "./members.service";

@Controller("members")
@UseInterceptors(ResponseTransformInterceptor)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Patch()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.ROLE, EPermission.UPDATE)], {
    requireActiveOrganization: true,
  })
  async updateMemberRole(
    @Body() dto: UpdateMemberRoleDto,
    @Req() req: Request,
  ): Promise<IUpdateMemberRoleResponse> {
    const organizationId = req.session?.session.activeOrganizationId;

    if (!organizationId) {
      return {
        success: false,
        message: "No active organization",
      };
    }

    return this.membersService.updateMemberRole(dto, organizationId);
  }

  @Post("system-roles")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.ROLE, EPermission.UPDATE)])
  async updateSystemRoles(@Body() dto: UpdateSystemRolesDto): Promise<IUpdateMemberRoleResponse> {
    return this.membersService.updateSystemRoles(dto);
  }
}
