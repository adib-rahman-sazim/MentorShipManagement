import { Injectable } from "@nestjs/common";

import type { Permission } from "@/common/entities/permissions.entity";

import {
  permissionCodesByEffect,
  resolveEffectivePermissionCodes,
} from "./effective-permissions.helpers";
import { EPermissionOverrideEffect } from "./permissions.enums";
import type { IEffectivePermissionsContext } from "./permissions.interfaces";
import { PermissionsRepository } from "./permissions.repository";
import { RolePermissionsRepository } from "./role-permissions.repository";
import { UserPermissionOverridesRepository } from "./user-permission-overrides.repository";

@Injectable()
export class EffectivePermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
    private readonly userPermissionOverridesRepository: UserPermissionOverridesRepository,
  ) {}

  async resolveForUser(context: IEffectivePermissionsContext): Promise<Permission[]> {
    const [rolePermissions, overrides, allPermissions] = await Promise.all([
      this.rolePermissionsRepository.findPermissionsByRoleCode(context.role),
      this.userPermissionOverridesRepository.findLiveByUserId(context.userId),
      this.permissionsRepository.findAllPermissions(),
    ]);

    const effectiveCodes = resolveEffectivePermissionCodes({
      roleCodes: rolePermissions.map((permission) => permission.code),
      grantedCodes: permissionCodesByEffect(overrides, EPermissionOverrideEffect.ALLOW),
      revokedCodes: permissionCodesByEffect(overrides, EPermissionOverrideEffect.REVOKE),
      allCodes: allPermissions.map((permission) => permission.code),
    });

    const permissionsByCode = new Map(
      allPermissions.map((permission) => [permission.code, permission]),
    );

    return effectiveCodes
      .map((code) => permissionsByCode.get(code))
      .filter((permission): permission is Permission => !!permission);
  }
}
