import { Controller, Get, Req, UseInterceptors } from "@nestjs/common";

import type { Request } from "express";

import { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";

import { GetMyCaslRulesInteractor } from "./interactors/get-my-casl-rules.interactor";
import { GetMyCaslRulesResponse } from "./permissions.dtos";

@Controller("permissions")
@UseInterceptors(ResponseTransformInterceptor)
export class PermissionsController {
  constructor(private readonly getMyCaslRulesInteractor: GetMyCaslRulesInteractor) {}

  @Get("my")
  async getMyPermissions(@Req() req: Request): Promise<GetMyCaslRulesResponse> {
    const userId = req.user!.id;
    const roles = (req.user?.roles ?? []) as EUserRole[];
    const activeOrganizationId = req.session?.session?.activeOrganizationId ?? undefined;

    return this.getMyCaslRulesInteractor.execute({
      userId,
      roles,
      activeOrganizationId: activeOrganizationId ?? undefined,
    });
  }
}
