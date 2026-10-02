import { Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { EUserRole } from "@/common/enums/roles.enums";
import { RolesRepository } from "@/modules/permissions/roles.repository";

import { UsersRepository } from "./users.repository";
import { assertNoExistingSuperadmin } from "./users-role-assignment.helpers";

@Injectable()
export class UsersRoleAssignmentService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async assertSuperadminSlotFree(
    targetRole: EUserRole,
    em: EntityManager,
    targetUserId?: string,
  ): Promise<void> {
    if (targetRole !== EUserRole.SUPERADMIN) {
      return;
    }

    await this.rolesRepository.findByCodeForUpdate(EUserRole.SUPERADMIN, em);

    const existingSuperadmin = await this.usersRepository.findActiveSuperadmin(em);

    assertNoExistingSuperadmin(targetRole, existingSuperadmin?.id ?? null, targetUserId);
  }
}
