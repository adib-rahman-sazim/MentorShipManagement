import { ConflictException, ForbiddenException } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";

import { USER_ERROR_MESSAGES } from "./users.constants";

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
