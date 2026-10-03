import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from "@nestjs/swagger";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermissionCode } from "@/modules/permissions/permissions.enums";

import { CreateMentorshipDraftInteractor } from "./interactors/create-mentorship-draft.interactor";
import { UpdateMentorshipDraftInteractor } from "./interactors/update-mentorship-draft.interactor";
import { CreateMentorshipDraftDto, UpdateMentorshipDraftDto } from "./mentorship-drafts.dtos";
import {
  MentorshipDraftApiResponse,
  MentorshipDraftInvalidItemsResponse,
  MentorshipDraftResponse,
} from "./mentorship-drafts.responses";

@Controller("mentorship-drafts")
@UseInterceptors(ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: MentorshipDraftInvalidItemsResponse })
export class MentorshipDraftsController {
  constructor(
    private readonly createMentorshipDraftInteractor: CreateMentorshipDraftInteractor,
    private readonly updateMentorshipDraftInteractor: UpdateMentorshipDraftInteractor,
  ) {}

  @Post()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_CREATE_DRAFT])
  @ApiCreatedResponse({ type: MentorshipDraftApiResponse })
  async createDraft(
    @Req() req: Request,
    @Body() dto: CreateMentorshipDraftDto,
  ): Promise<MentorshipDraftResponse> {
    return this.createMentorshipDraftInteractor.execute({
      dto,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }

  @Patch(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_CREATE_DRAFT])
  @ApiOkResponse({ type: MentorshipDraftApiResponse })
  async updateDraft(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) draftId: string,
    @Body() dto: UpdateMentorshipDraftDto,
  ): Promise<MentorshipDraftResponse> {
    return this.updateMentorshipDraftInteractor.execute({
      draftId,
      dto,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }
}
