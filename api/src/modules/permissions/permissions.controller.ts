import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";

import { GetMyCaslRulesInteractor } from "./interactors/get-my-casl-rules.interactor";
import { GetUserPermissionOverridesInteractor } from "./interactors/get-user-permission-overrides.interactor";
import { ReplaceUserPermissionOverridesInteractor } from "./interactors/replace-user-permission-overrides.interactor";
import {
  GetMyCaslRulesResponse,
  ReplaceUserPermissionOverridesDto,
  UserPermissionOverridesApiResponse,
  UserPermissionOverridesResponse,
} from "./permissions.dtos";
import { EPermissionCode } from "./permissions.enums";

@Controller("permissions")
@UseInterceptors(ResponseTransformInterceptor)
export class PermissionsController {
  constructor(
    private readonly getMyCaslRulesInteractor: GetMyCaslRulesInteractor,
    private readonly getUserPermissionOverridesInteractor: GetUserPermissionOverridesInteractor,
    private readonly replaceUserPermissionOverridesInteractor: ReplaceUserPermissionOverridesInteractor,
  ) {}

  @Get("my")
  async getMyPermissions(@Req() req: Request): Promise<GetMyCaslRulesResponse> {
    const userId = req.user!.id;
    const role = req.user?.role as EUserRole | undefined;

    return this.getMyCaslRulesInteractor.execute({ userId, role });
  }

  @Get("users/:userId/overrides")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_READ_PERMISSION])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Return every permission for one user, with where it came from." })
  @ApiOkResponse({ type: UserPermissionOverridesApiResponse })
  @ApiForbiddenResponse({ description: "Only the superadmin can read per-user overrides." })
  @ApiNotFoundResponse({ description: "User not found." })
  async getUserPermissionOverrides(
    @Req() req: Request,
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<UserPermissionOverridesResponse> {
    return this.getUserPermissionOverridesInteractor.execute({
      userId,
      actorId: req.user!.id,
      actorRole: req.user!.role as EUserRole,
    });
  }

  @Put("users/:userId/overrides")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_UPDATE_PERMISSION])
  @ApiBearerAuth()
  @ApiOperation({ summary: "Replace the per-user permission overrides for one user." })
  @ApiOkResponse({ type: UserPermissionOverridesApiResponse })
  @ApiForbiddenResponse({
    description:
      "Only the superadmin can write per-user overrides, and the superadmin's own record is not editable.",
  })
  @ApiNotFoundResponse({ description: "User or permission code not found." })
  async replaceUserPermissionOverrides(
    @Req() req: Request,
    @Param("userId", ParseUUIDPipe) userId: string,
    @Body() dto: ReplaceUserPermissionOverridesDto,
  ): Promise<UserPermissionOverridesResponse> {
    return this.replaceUserPermissionOverridesInteractor.execute({
      userId,
      dto,
      actorId: req.user!.id,
      actorRole: req.user!.role as EUserRole,
    });
  }
}
