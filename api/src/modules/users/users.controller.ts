import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";
import type { IPaginatedUsersResponse, IUserResponse } from "./users.interfaces";
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
  @Permissions([createPermission(EResource.USER, EPermission.LIST)])
  async listUsers(@Query() query: ListUsersQueryDto): Promise<IPaginatedUsersResponse> {
    return this.usersService.listUsers(query);
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
