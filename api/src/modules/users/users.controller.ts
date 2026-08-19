import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

import { InviteUserDto, ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";
import type {
  IInviteUserResponse,
  IPaginatedUsersResponse,
  IUserResponse,
} from "./users.interfaces";
import { UsersService } from "./users.service";

@Controller("users")
@UseInterceptors(ResponseTransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async getMe(@Req() req: Request): Promise<IUserResponse> {
    return this.usersService.getCurrentUser(req.user!.id);
  }

  @Patch("me")
  async updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<IUserResponse> {
    return this.usersService.updateProfile(req.user!.id, dto);
  }

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.LIST)], {
    requireActiveOrganization: true,
  })
  async listUsers(
    @Query() query: ListUsersQueryDto,
    @Req() req: Request,
  ): Promise<IPaginatedUsersResponse> {
    const organizationId = req.session?.session.activeOrganizationId;

    if (!organizationId) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }

    return this.usersService.listUsers(query, organizationId);
  }

  @Post()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.CREATE)], {
    requireActiveOrganization: true,
  })
  inviteUser(@Body() dto: InviteUserDto, @Req() req: Request): Promise<IInviteUserResponse> {
    const organizationId = req.session?.session.activeOrganizationId;

    if (!organizationId) {
      return Promise.resolve({
        success: false,
        message: "No active organization",
      });
    }

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    return this.usersService.inviteUser(
      dto,
      organizationId,
      {
        id: req.user!.id,
        email: req.user!.email,
        roles: (req.user?.roles ?? []) as EUserRole[],
      },
      headers,
    );
  }

  @Patch(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.UPDATE)])
  async updateUser(
    @Param("id") userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<IUserResponse> {
    return this.usersService.updateUser(userId, dto);
  }
}
