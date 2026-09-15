import { ForbiddenException } from "@nestjs/common";

import { EUserRole } from "@/common/enums/roles.enums";

import { USER_ERROR_MESSAGES } from "./users.constants";

export function assertActorCanAssignRole(actorRole: EUserRole, targetRole: EUserRole): void {
  if (targetRole === EUserRole.SUPERADMIN && actorRole !== EUserRole.SUPERADMIN) {
    throw new ForbiddenException(USER_ERROR_MESSAGES.CANNOT_ASSIGN_SUPERADMIN);
  }
}
