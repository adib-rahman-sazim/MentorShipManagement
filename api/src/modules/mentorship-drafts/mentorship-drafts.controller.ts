import {
  Body,
  Controller,
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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from "@nestjs/swagger";

import type { Request } from "express";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermissionCode } from "@/modules/permissions/permissions.enums";

import { ApproveMentorshipDraftInteractor } from "./interactors/approve-mentorship-draft.interactor";
import { CreateMentorshipDraftInteractor } from "./interactors/create-mentorship-draft.interactor";
import { GetMentorshipDraftInteractor } from "./interactors/get-mentorship-draft.interactor";
import { ListMentorshipDraftsInteractor } from "./interactors/list-mentorship-drafts.interactor";
import { RejectMentorshipDraftInteractor } from "./interactors/reject-mentorship-draft.interactor";
import { SubmitMentorshipDraftInteractor } from "./interactors/submit-mentorship-draft.interactor";
import { UpdateMentorshipDraftInteractor } from "./interactors/update-mentorship-draft.interactor";
import {
  CreateMentorshipDraftDto,
  DecideMentorshipDraftDto,
  ListMentorshipDraftsQueryDto,
  UpdateMentorshipDraftDto,
} from "./mentorship-drafts.dtos";
import {
  MentorshipDraftApiResponse,
  MentorshipDraftDetailApiResponse,
  MentorshipDraftDetailResponse,
  MentorshipDraftInvalidItemsResponse,
  MentorshipDraftResponse,
  MentorshipDraftStaleItemsResponse,
  PaginatedMentorshipDraftsApiResponse,
  PaginatedMentorshipDraftsResponse,
} from "./mentorship-drafts.responses";

@Controller("mentorship-drafts")
@UseInterceptors(ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiBadRequestResponse({ type: MentorshipDraftInvalidItemsResponse })
export class MentorshipDraftsController {
  constructor(
    private readonly createMentorshipDraftInteractor: CreateMentorshipDraftInteractor,
    private readonly updateMentorshipDraftInteractor: UpdateMentorshipDraftInteractor,
    private readonly submitMentorshipDraftInteractor: SubmitMentorshipDraftInteractor,
    private readonly listMentorshipDraftsInteractor: ListMentorshipDraftsInteractor,
    private readonly getMentorshipDraftInteractor: GetMentorshipDraftInteractor,
    private readonly approveMentorshipDraftInteractor: ApproveMentorshipDraftInteractor,
    private readonly rejectMentorshipDraftInteractor: RejectMentorshipDraftInteractor,
  ) {}

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_READ_DRAFT])
  @ApiOkResponse({ type: PaginatedMentorshipDraftsApiResponse })
  async listDrafts(
    @Req() req: Request,
    @Query() query: ListMentorshipDraftsQueryDto,
  ): Promise<PaginatedMentorshipDraftsResponse> {
    return this.listMentorshipDraftsInteractor.execute({
      query,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }

  @Get(":id")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_READ_DRAFT])
  @ApiOkResponse({ type: MentorshipDraftDetailApiResponse })
  async getDraft(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) draftId: string,
  ): Promise<MentorshipDraftDetailResponse> {
    return this.getMentorshipDraftInteractor.execute({
      draftId,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }

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

  @Post(":id/submit")
  @HttpCode(HttpStatus.OK)
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_CREATE_DRAFT])
  @ApiOkResponse({ type: MentorshipDraftDetailApiResponse })
  async submitDraft(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) draftId: string,
  ): Promise<MentorshipDraftDetailResponse> {
    return this.submitMentorshipDraftInteractor.execute({
      draftId,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }

  @Post(":id/approve")
  @HttpCode(HttpStatus.OK)
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_APPROVE_DRAFT])
  @ApiOkResponse({ type: MentorshipDraftDetailApiResponse })
  @ApiConflictResponse({ type: MentorshipDraftStaleItemsResponse })
  async approveDraft(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) draftId: string,
    @Body() dto: DecideMentorshipDraftDto,
  ): Promise<MentorshipDraftDetailResponse> {
    return this.approveMentorshipDraftInteractor.execute({
      draftId,
      dto,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }

  @Post(":id/reject")
  @HttpCode(HttpStatus.OK)
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_REVIEW_DRAFT])
  @ApiOkResponse({ type: MentorshipDraftDetailApiResponse })
  async rejectDraft(
    @Req() req: Request,
    @Param("id", ParseUUIDPipe) draftId: string,
    @Body() dto: DecideMentorshipDraftDto,
  ): Promise<MentorshipDraftDetailResponse> {
    return this.rejectMentorshipDraftInteractor.execute({
      draftId,
      dto,
      actorId: req.user!.id,
      ability: req.ability!,
    });
  }
}
