import { BadRequestException, ForbiddenException } from "@nestjs/common";

import { ALL_MANAGE_PERMISSION_CODE } from "./permissions.catalog.constants";
import { PERMISSION_OVERRIDE_ERROR_MESSAGES } from "./permissions.constants";
import { EPermissionSource } from "./permissions.enums";
import type { IAllManageInput, IPermissionSourceInput } from "./permissions.interfaces";

export function isAllManageHeld({ roleCodes, revokedCodes }: IAllManageInput): boolean {
  return (
    roleCodes.includes(ALL_MANAGE_PERMISSION_CODE) &&
    !revokedCodes.includes(ALL_MANAGE_PERMISSION_CODE)
  );
}

export function resolvePermissionSource(
  code: string,
  { effectiveCodes, grantedCodes, revokedCodes }: IPermissionSourceInput,
): EPermissionSource {
  if (revokedCodes.has(code)) {
    return EPermissionSource.REVOKED;
  }

  if (grantedCodes.has(code)) {
    return EPermissionSource.GRANTED;
  }

  if (effectiveCodes.has(code)) {
    return EPermissionSource.ROLE;
  }

  return EPermissionSource.NONE;
}

export function findDuplicatePermissionCode(codes: string[]): string | null {
  const seen = new Set<string>();

  for (const code of codes) {
    if (seen.has(code)) {
      return code;
    }
    seen.add(code);
  }

  return null;
}

export function assertActorHoldsAllManage(actorHoldsAllManage: boolean): void {
  if (!actorHoldsAllManage) {
    throw new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.ACTOR_NOT_SUPERADMIN);
  }
}

export function assertTargetIsEditable(targetHoldsAllManage: boolean): void {
  if (targetHoldsAllManage) {
    throw new ForbiddenException(PERMISSION_OVERRIDE_ERROR_MESSAGES.SUPERADMIN_NOT_EDITABLE);
  }
}

export function assertNoDuplicatePermissionCodes(codes: string[]): void {
  const duplicate = findDuplicatePermissionCode(codes);

  if (duplicate) {
    throw new BadRequestException(
      `${PERMISSION_OVERRIDE_ERROR_MESSAGES.DUPLICATE_PERMISSION_CODE}: ${duplicate}`,
    );
  }
}
