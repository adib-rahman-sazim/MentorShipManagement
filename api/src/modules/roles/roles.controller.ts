import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";

import { Permissions } from "@/common/decorators/auth/permissions.decorator";
import type { EUserRole } from "@/common/enums/roles.enums";
import { ResponseTransformInterceptor } from "@/common/interceptors/response-transform.interceptor";
import { CaslPermissionsGuard } from "@/modules/casl/casl.guard";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { RolesService } from "./roles.service";

@Controller("roles")
@UseInterceptors(ResponseTransformInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(CaslPermissionsGuard)
  @Permissions([createPermission(EResource.ROLE, EPermission.LIST)])
  getRoles(): EUserRole[] {
    return this.rolesService.getRoles();
  }
}
