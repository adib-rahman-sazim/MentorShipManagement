import { Controller, Get, Req, UseInterceptors } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import type { Request } from "express";

import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";

import { GetMyMentorshipInteractor } from "./interactors/get-my-mentorship.interactor";
import { MyMentorshipApiResponse, MyMentorshipResponse } from "./mentorships.responses";

@Controller("mentorships")
@UseInterceptors(ResponseTransformInterceptor)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Missing, expired or otherwise invalid session token." })
@ApiForbiddenResponse({ description: "The account is deactivated." })
export class MentorshipsController {
  constructor(private readonly getMyMentorshipInteractor: GetMyMentorshipInteractor) {}

  @Get("me")
  @ApiOperation({
    summary: "Return who the current user reports to and who reports to them.",
  })
  @ApiOkResponse({ type: MyMentorshipApiResponse })
  async getMyMentorship(@Req() req: Request): Promise<MyMentorshipResponse> {
    return this.getMyMentorshipInteractor.execute(req.user!.id);
  }
}