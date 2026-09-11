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
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";
import { PaginatedUsersResponse, UserResponse } from "./users.responses";
import { UsersService } from "./users.service";

@Controller("users")
@UseInterceptors(ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing, expired or otherwise invalid session token." })
@ApiForbiddenResponse({
  description: "The account is deactivated or lacks the required permission.",
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Return the currently authenticated user, including their role." })
  @ApiOkResponse({ type: UserResponse })
  async getMe(@Req() req: Request): Promise<UserResponse> {
    return this.usersService.getCurrentUser(req.user!.id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the current user's own profile." })
  @ApiOkResponse({ type: UserResponse })
  async updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto): Promise<UserResponse> {
    return this.usersService.updateProfile(req.user!.id, dto);
  }

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.LIST)])
  @ApiOperation({ summary: "List users." })
  @ApiOkResponse({ type: PaginatedUsersResponse })
  async listUsers(@Query() query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.usersService.listUsers(query);
  }

  @Patch(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.UPDATE)])
  @ApiOperation({ summary: "Update another user." })
  @ApiOkResponse({ type: UserResponse })
  async updateUser(@Param("id") userId: string, @Body() dto: UpdateUserDto): Promise<UserResponse> {
    return this.usersService.updateUser(userId, dto);
  }
}
