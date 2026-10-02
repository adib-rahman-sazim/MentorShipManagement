import type { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";

import { ALL_MANAGE_PERMISSION_CODE } from "./permissions.catalog.constants";
import type { EPermissionOverrideEffect } from "./permissions.enums";
import type {
  IEffectivePermissionCodesInput,
  IExpandedAllManageInput,
} from "./permissions.interfaces";

export function permissionCodesByEffect(
  overrides: UserPermissionOverride[],
  effect: EPermissionOverrideEffect,
): string[] {
  return overrides
    .filter((override) => override.effect === effect)
    .map((override) => override.permission.code);
}

export function resolveEffectivePermissionCodes({
  roleCodes,
  grantedCodes,
  revokedCodes,
  allCodes,
}: IEffectivePermissionCodesInput): string[] {
  const grantedCodeSet = new Set([...roleCodes, ...grantedCodes]);

  const effectiveCodeSet = grantedCodeSet.has(ALL_MANAGE_PERMISSION_CODE)
    ? new Set(allCodes.filter((code) => code !== ALL_MANAGE_PERMISSION_CODE))
    : grantedCodeSet;

  for (const revokedCode of revokedCodes) {
    effectiveCodeSet.delete(revokedCode);
  }

  return [...effectiveCodeSet].sort();
}

export function holdsExpandedAllManage({
  roleCodes,
  grantedCodes,
}: IExpandedAllManageInput): boolean {
  return [...roleCodes, ...grantedCodes].includes(ALL_MANAGE_PERMISSION_CODE);
}
