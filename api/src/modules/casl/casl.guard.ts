import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Request } from "express";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";
import { parsePermissionString } from "@/utils/permission-string/permission-string.helpers";

@Injectable()
export class CaslPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<IPermissionsOptions | string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    let permissions: string[];

    if (Array.isArray(metadata)) {
      permissions = metadata;
    } else if (metadata && typeof metadata === "object") {
      permissions = metadata.permissions;
    } else {
      return true;
    }

    if (!permissions.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const userId = user?.id;
    const role = user?.role;

    if (!userId || !role || !Object.values(EUserRole).includes(role)) {
      throw new ForbiddenException("User role not found");
    }

    const ability = await this.caslAbilityFactory.createForUser({ userId, role });

    request.ability = ability;

    for (const requiredPerm of permissions) {
      const parsed = parsePermissionString(requiredPerm);
      const action = parsed.action as EPermission;
      const resourceType = parsed.resource as EResource;

      if (!ability.can(action, resourceType)) {
        throw new ForbiddenException(`Missing required permission: ${requiredPerm}`);
      }
    }

    return true;
  }
}
