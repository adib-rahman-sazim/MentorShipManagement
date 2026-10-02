import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { Request } from "express";

import { PERMISSIONS_KEY } from "@/common/decorators/auth/permissions.decorator.constants";
import type { IPermissionsOptions } from "@/common/decorators/auth/permissions.decorator.interfaces";
import { EUserRole } from "@/common/enums/roles.enums";
import { CaslAbilityFactory } from "@/modules/casl/casl.ability-factory";
import type { TSubjects } from "@/modules/casl/casl.types";
import { PERMISSION_DEFINITIONS_BY_CODE } from "@/modules/permissions/permissions.catalog.constants";
import type { EPermissionCode } from "@/modules/permissions/permissions.enums";
import type { IPermissionDefinition } from "@/modules/permissions/permissions.interfaces";

@Injectable()
export class CaslPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<IPermissionsOptions | EPermissionCode[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    let permissions: EPermissionCode[];
    let subjectIdParam: string | undefined;

    if (Array.isArray(metadata)) {
      permissions = metadata;
    } else if (metadata && typeof metadata === "object") {
      permissions = metadata.permissions;
      subjectIdParam = metadata.subjectIdParam;
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

    for (const requiredCode of permissions) {
      const definition = PERMISSION_DEFINITIONS_BY_CODE.get(requiredCode);

      if (!definition) {
        throw new ForbiddenException(`Unknown required permission: ${requiredCode}`);
      }

      const subject = this.resolveSubject(definition, request, subjectIdParam);

      if (!ability.can(definition.action, subject)) {
        throw new ForbiddenException(`Missing required permission: ${requiredCode}`);
      }
    }

    return true;
  }

  private resolveSubject(
    definition: IPermissionDefinition,
    request: Request,
    subjectIdParam?: string,
  ): TSubjects {
    if (!subjectIdParam) {
      return definition.resource;
    }

    const subjectId = request.params?.[subjectIdParam];

    if (typeof subjectId !== "string" || !subjectId) {
      throw new ForbiddenException(`Missing subject identifier: ${subjectIdParam}`);
    }

    return { __caslSubjectType__: definition.resource, id: subjectId };
  }
}
