import {
  Body,
  Controller,
  Delete,
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
import { Public } from "@/common/decorators/auth/public.decorator";
import { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { resolveEffectiveRole } from "@/modules/permissions/permissions.role-priority.helpers";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import {
  CreateInvitationDto,
  ListInvitationsQueryDto,
  ValidateOrganizationInvitationQueryDto,
  ValidateSystemInvitationQueryDto,
} from "./invitations.dtos";
import { convertExpressHeadersToHeaders } from "./invitations.helpers";
import type {
  CreateInvitationResultResponse,
  InvitationResponse,
  OrganizationInvitationValidationResponse,
  PaginatedInvitationsResponse,
  SystemInvitationValidationResponse,
} from "./invitations.responses";
import { InvitationsService } from "./invitations.service";

@Controller("invitations")
@UseInterceptors(ResponseTransformInterceptor)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.CREATE)])
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @Req() req: Request,
  ): Promise<CreateInvitationResultResponse> {
    const inviterRole = this.resolveInviterRole(req);
    const organizationId = req.session?.session.activeOrganizationId ?? undefined;
    const headers = convertExpressHeadersToHeaders(req.headers);

    return this.invitationsService.create(
      dto,
      {
        inviterId: req.user!.id,
        inviterRole,
        inviterEmail: req.user!.email,
        organizationId,
      },
      headers,
    );
  }

  @Get("system/validate")
  @Public()
  async validateSystemInvitation(
    @Query() query: ValidateSystemInvitationQueryDto,
  ): Promise<SystemInvitationValidationResponse> {
    return this.invitationsService.validateSystem(query.token);
  }

  @Get("organization/validate")
  @Public()
  async validateOrganizationInvitation(
    @Query() query: ValidateOrganizationInvitationQueryDto,
  ): Promise<OrganizationInvitationValidationResponse> {
    return this.invitationsService.validateOrganization(query.id);
  }

  @Get("my-pending")
  listMyPendingInvitations(@Req() req: Request): Promise<InvitationResponse[]> {
    return this.invitationsService.listMyPending(req.user!.email);
  }

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.LIST)])
  async listInvitations(
    @Query() query: ListInvitationsQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedInvitationsResponse> {
    const inviterRole = this.resolveInviterRole(req);
    const organizationId = req.session?.session.activeOrganizationId ?? undefined;

    return this.invitationsService.list(query, inviterRole, organizationId);
  }

  @Get(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.READ)])
  getInvitation(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<InvitationResponse> {
    const inviterRole = this.resolveInviterRole(req);
    const organizationId = req.session?.session.activeOrganizationId ?? undefined;

    return this.invitationsService.get(id, inviterRole, organizationId);
  }

  @Delete(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.CANCEL)])
  async cancelInvitation(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<InvitationResponse> {
    const inviterRole = this.resolveInviterRole(req);
    const organizationId = req.session?.session.activeOrganizationId ?? undefined;

    return this.invitationsService.cancel(id, inviterRole, organizationId);
  }

  @Post(":id/resend")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.INVITATION, EPermission.CREATE)])
  async resendInvitation(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<CreateInvitationResultResponse> {
    const inviterRole = this.resolveInviterRole(req);
    const organizationId = req.session?.session.activeOrganizationId ?? undefined;
    const headers = convertExpressHeadersToHeaders(req.headers);

    return this.invitationsService.resend(
      id,
      {
        inviterId: req.user!.id,
        inviterRole,
        inviterEmail: req.user!.email,
        organizationId,
      },
      headers,
    );
  }

  private resolveInviterRole(req: Request): EUserRole {
    const roles = (req.user?.roles ?? []) as EUserRole[];
    const effectiveRole = resolveEffectiveRole(roles);
    if (!effectiveRole) {
      return EUserRole.CUSTOMER;
    }
    return effectiveRole;
  }
}
