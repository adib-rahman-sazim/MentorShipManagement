import { Injectable, NotFoundException } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { UsersRepository } from "@/modules/users/users.repository";

import { AllManageHolderService } from "../all-manage-holder.service";
import { EffectivePermissionsService } from "../effective-permissions.service";
import { PERMISSION_OVERRIDE_ERROR_MESSAGES } from "../permissions.constants";
import type { UserPermissionOverridesResponse } from "../permissions.dtos";
import type { IGetUserPermissionOverridesContext } from "../permissions.interfaces";
import { PermissionsSerializer } from "../permissions.serializer";
import { assertActorHoldsAllManage } from "../user-permission-overrides.helpers";

@Injectable()
export class GetUserPermissionOverridesInteractor
  implements IBaseInteractor<IGetUserPermissionOverridesContext, UserPermissionOverridesResponse>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly allManageHolderService: AllManageHolderService,
    private readonly effectivePermissionsService: EffectivePermissionsService,
    private readonly permissionsSerializer: PermissionsSerializer,
  ) {}

  async execute({
    userId,
    actorId,
    actorRole,
  }: IGetUserPermissionOverridesContext): Promise<UserPermissionOverridesResponse> {
    assertActorHoldsAllManage(await this.allManageHolderService.holdsAllManage(actorId, actorRole));

    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(PERMISSION_OVERRIDE_ERROR_MESSAGES.TARGET_USER_NOT_FOUND);
    }

    const resolved = await this.effectivePermissionsService.resolveCodesForUser({
      userId: user.id,
      role: user.role.code,
    });

    return this.permissionsSerializer.serializeUserPermissions({ user, ...resolved });
  }
}
