import { Injectable } from "@nestjs/common";

import type { Permission } from "@/common/entities/permissions.entity";

import {
  permissionCodesByEffect,
  resolveEffectivePermissionCodes,
} from "./effective-permissions.helpers";
import { EPermissionOverrideEffect } from "./permissions.enums";
import type {
  IEffectivePermissionsContext,
  IResolvedPermissionCodes,
} from "./permissions.interfaces";
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

  async resolveCodesForUser(
    context: IEffectivePermissionsContext,
  ): Promise<IResolvedPermissionCodes> {
    const [rolePermissions, overrides, allPermissions] = await Promise.all([
      this.rolePermissionsRepository.findPermissionsByRoleCode(context.role),
      this.userPermissionOverridesRepository.findLiveByUserId(context.userId),
      this.permissionsRepository.findAllPermissions(),
    ]);

    const grantedCodes = permissionCodesByEffect(overrides, EPermissionOverrideEffect.ALLOW);
    const revokedCodes = permissionCodesByEffect(overrides, EPermissionOverrideEffect.REVOKE);

    const effectiveCodes = resolveEffectivePermissionCodes({
      roleCodes: rolePermissions.map((permission) => permission.code),
      grantedCodes,
      revokedCodes,
      allCodes: allPermissions.map((permission) => permission.code),
    });

    return { allPermissions, effectiveCodes, grantedCodes, revokedCodes };
  }

  async resolveForUser(context: IEffectivePermissionsContext): Promise<Permission[]> {
    const { allPermissions, effectiveCodes } = await this.resolveCodesForUser(context);

    const permissionsByCode = new Map(
      allPermissions.map((permission) => [permission.code, permission]),
    );

    return effectiveCodes
      .map((code) => permissionsByCode.get(code))
      .filter((permission): permission is Permission => !!permission);
  }
}
