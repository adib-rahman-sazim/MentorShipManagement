import { EUserRole } from "@/common/enums/roles.enums";

import { ROLE_PRIORITY } from "./permissions.role-priority.constants";

export function normalizeRolesByPriority(roles?: EUserRole[] | string[] | null): EUserRole[] {
  if (!roles?.length) {
    return [];
  }

  const validRoles = new Set(
    roles.filter((role): role is EUserRole => Object.values(EUserRole).includes(role as EUserRole)),
  );

  return ROLE_PRIORITY.filter((role) => validRoles.has(role));
}

export function resolveEffectiveRole(roles?: EUserRole[] | string[] | null): EUserRole | null {
  return normalizeRolesByPriority(roles)[0] ?? null;
}