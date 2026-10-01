import { Controller, Get, Req, UseGuards, UseInterceptors } from "@nestjs/common";
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
import { EPermissionCode } from "@/modules/permissions/permissions.enums";

import { GetMentorshipGraphInteractor } from "./interactors/get-mentorship-graph.interactor";
import { GetMyMentorshipInteractor } from "./interactors/get-my-mentorship.interactor";
import {
  MentorshipGraphApiResponse,
  MentorshipGraphResponse,
  MyMentorshipApiResponse,
  MyMentorshipResponse,
} from "./mentorships.responses";

@Controller("mentorships")
@UseInterceptors(ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing, expired or otherwise invalid session token." })
@ApiForbiddenResponse({ description: "The account is deactivated." })
export class MentorshipsController {
  constructor(
    private readonly getMyMentorshipInteractor: GetMyMentorshipInteractor,
    private readonly getMentorshipGraphInteractor: GetMentorshipGraphInteractor,
  ) {}

  @Get("me")
  @ApiOperation({
    summary: "Return who the current user reports to and who reports to them.",
  })
  @ApiOkResponse({ type: MyMentorshipApiResponse })
  async getMyMentorship(@Req() req: Request): Promise<MyMentorshipResponse> {
    return this.getMyMentorshipInteractor.execute(req.user!.id);
  }

  @Get("graph")
  @UseGuards(CaslPermissionsGuard)
  @Permissions([EPermissionCode.CAN_VIEW_MENTORSHIP_GRAPH])
  @ApiOperation({
    summary: "Return every person in the hierarchy and every active mentorship between them.",
  })
  @ApiOkResponse({ type: MentorshipGraphApiResponse })
  @ApiForbiddenResponse({ description: "The caller cannot view the mentorship graph." })
  async getMentorshipGraph(): Promise<MentorshipGraphResponse> {
    return this.getMentorshipGraphInteractor.execute();
  }
}
