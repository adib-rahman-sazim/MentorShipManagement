import { Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import type { EUserRole } from "@/common/enums/roles.enums";

import { permissionCodesByEffect } from "./effective-permissions.helpers";
import { EPermissionOverrideEffect } from "./permissions.enums";
import { RolePermissionsRepository } from "./role-permissions.repository";
import { isAllManageHeld } from "./user-permission-overrides.helpers";
import { UserPermissionOverridesRepository } from "./user-permission-overrides.repository";

@Injectable()
export class AllManageHolderService {
  constructor(
    private readonly rolePermissionsRepository: RolePermissionsRepository,
    private readonly userPermissionOverridesRepository: UserPermissionOverridesRepository,
  ) {}

  async holdsAllManage(userId: string, role: EUserRole, em?: EntityManager): Promise<boolean> {
    const [rolePermissions, overrides] = await Promise.all([
      this.rolePermissionsRepository.findPermissionsByRoleCode(role, em),
      this.userPermissionOverridesRepository.findLiveByUserId(userId, em),
    ]);

    return isAllManageHeld({
      roleCodes: rolePermissions.map((permission) => permission.code),
      revokedCodes: permissionCodesByEffect(overrides, EPermissionOverrideEffect.REVOKE),
    });
  }
}
