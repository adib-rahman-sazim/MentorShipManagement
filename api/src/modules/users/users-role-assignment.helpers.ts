import { ConflictException, ForbiddenException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { EUserRole } from "@/common/enums/roles.enums";

import { USER_ERROR_MESSAGES } from "./users.constants";
import type { ISuperadminGuardRepositories } from "./users.interfaces";

export function assertActorCanAssignRole(actorRole: EUserRole, targetRole: EUserRole): void {
  if (targetRole === EUserRole.SUPERADMIN && actorRole !== EUserRole.SUPERADMIN) {
    throw new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_ASSIGN_SUPERADMIN);
  }
}

export function assertNoExistingSuperadmin(
  targetRole: EUserRole,
  existingSuperadminId: string | null,
  targetUserId?: string,
): void {
  if (targetRole !== EUserRole.SUPERADMIN || existingSuperadminId === null) {
    return;
  }

  if (existingSuperadminId === targetUserId) {
    return;
  }

  throw new ConflictException(USER_ERROR_MESSAGES.SUPERADMIN_ALREADY_EXISTS);
}

export function assertSuperadminNotDemoted(currentRole: EUserRole, targetRole: EUserRole): void {
  if (currentRole === EUserRole.SUPERADMIN && targetRole !== EUserRole.SUPERADMIN) {
    throw new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_DEMOTE_SUPERADMIN);
  }
}

export async function assertSuperadminSlotFree(
  targetRole: EUserRole,
  em: EntityManager,
  repositories: ISuperadminGuardRepositories,
  targetUserId?: string,
): Promise<void> {
  if (targetRole !== EUserRole.SUPERADMIN) {
    return;
  }

  await repositories.rolesRepository.findByCodeForUpdate(EUserRole.SUPERADMIN, em);

  const existingSuperadmin = await repositories.usersRepository.findActiveSuperadmin(em);

  assertNoExistingSuperadmin(targetRole, existingSuperadmin?.id ?? null, targetUserId);
}
