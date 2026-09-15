import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { CaslCacheService } from "@/modules/casl/casl-cache.service";
import { UsersRepository } from "@/modules/users/users.repository";

import { AllManageHolderService } from "../all-manage-holder.service";
import { EffectivePermissionsService } from "../effective-permissions.service";
import { PERMISSION_OVERRIDE_ERROR_MESSAGES } from "../permissions.constants";
import type { UserPermissionOverridesResponse } from "../permissions.dtos";
import type { IReplaceUserPermissionOverridesContext } from "../permissions.interfaces";
import { PermissionsRepository } from "../permissions.repository";
import { PermissionsSerializer } from "../permissions.serializer";
import {
  assertActorHoldsAllManage,
  assertNoDuplicatePermissionCodes,
  assertTargetIsEditable,
} from "../user-permission-overrides.helpers";
import { UserPermissionOverridesRepository } from "../user-permission-overrides.repository";

@Injectable()
export class ReplaceUserPermissionOverridesInteractor
  implements
    IBaseInteractor<IReplaceUserPermissionOverridesContext, UserPermissionOverridesResponse>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly userPermissionOverridesRepository: UserPermissionOverridesRepository,
    private readonly allManageHolderService: AllManageHolderService,
    private readonly effectivePermissionsService: EffectivePermissionsService,
    private readonly permissionsSerializer: PermissionsSerializer,
    private readonly caslCacheService: CaslCacheService,
  ) {}

  async execute({
    userId,
    actorId,
    actorRole,
    dto,
  }: IReplaceUserPermissionOverridesContext): Promise<UserPermissionOverridesResponse> {
    assertActorHoldsAllManage(await this.allManageHolderService.holdsAllManage(actorId, actorRole));

    assertNoDuplicatePermissionCodes(dto.overrides.map((override) => override.permissionCode));

    const user = await this.userPermissionOverridesRepository.transactional(async (em) => {
      const user = await this.usersRepository.findById(userId, em);

      if (!user) {
        throw new NotFoundException(PERMISSION_OVERRIDE_ERROR_MESSAGES.TARGET_USER_NOT_FOUND);
      }

      assertTargetIsEditable(
        await this.allManageHolderService.holdsAllManage(userId, user.role.code, em),
      );

      const allPermissions = await this.permissionsRepository.findAllPermissions(em);
      const permissionsByCode = new Map(
        allPermissions.map((permission) => [permission.code, permission]),
      );

      await this.userPermissionOverridesRepository.softDeleteLiveByUserId(userId, em);

      for (const { permissionCode, effect } of dto.overrides) {
        const permission = permissionsByCode.get(permissionCode);

        if (!permission) {
          throw new NotFoundException(
            `${PERMISSION_OVERRIDE_ERROR_MESSAGES.UNKNOWN_PERMISSION_CODE}: ${permissionCode}`,
          );
        }

        this.userPermissionOverridesRepository.createOverride(
          { user, permission, effect, reason: dto.reason ?? null },
          em,
        );
      }

      return user;
    });

    await this.caslCacheService.invalidateUser(userId);

    const resolved = await this.effectivePermissionsService.resolveCodesForUser({
      userId: user.id,
      role: user.role.code,
    });

    return this.permissionsSerializer.serializeUserPermissions({ user, ...resolved });
  }
}
