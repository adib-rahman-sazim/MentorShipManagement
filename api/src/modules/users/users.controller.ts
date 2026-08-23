import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
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

import { CreateUserDto, ListUsersQueryDto, UpdateProfileDto, UpdateUserDto } from "./users.dtos";
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

  @Post()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.CREATE)])
  @ApiOperation({ summary: "Provision a new user account with credentials." })
  @ApiCreatedResponse({ type: UserResponse })
  @ApiNotFoundResponse({ description: "The requested role does not exist." })
  @ApiConflictResponse({ description: "A user with this email already exists." })
  async createUser(@Req() req: Request, @Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.usersService.createUser(dto, req.user!.role!);
  }

  @Patch(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.UPDATE)])
  @ApiOperation({ summary: "Update another user." })
  @ApiOkResponse({ type: UserResponse })
  async updateUser(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.updateUser(userId, dto, req.user!.role!);
  }

  @Get(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.READ)])
  @ApiOperation({ summary: "Return a single user by id, including their role." })
  @ApiOkResponse({ type: UserResponse })
  @ApiNotFoundResponse({ description: "User not found." })
  async getUser(@Param("id", ParseUUIDPipe) userId: string): Promise<UserResponse> {
    return this.usersService.getUserById(userId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.USER, EPermission.DELETE)])
  @ApiOperation({ summary: "Soft-delete a user and revoke their sessions." })
  @ApiNoContentResponse({ description: "The user was soft-deleted." })
  @ApiNotFoundResponse({ description: "User not found." })
  async deleteUser(@Req() req: Request, @Param("id", ParseUUIDPipe) userId: string): Promise<void> {
    return this.usersService.deleteUser(userId, req.user!.id);
  }
}
