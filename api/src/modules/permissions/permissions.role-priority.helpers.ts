import { EUserRole } from "@/common/enums/roles.enums";

import {
  ORGANIZATION_BOUND_ROLES,
  ROLE_PRIORITY,
  SYSTEM_LEVEL_ROLES,
} from "./permissions.role-priority.constants";

export function isSystemLevelRole(role: EUserRole | string): boolean {
  return (SYSTEM_LEVEL_ROLES as readonly string[]).includes(role);
}

export function isOrganizationBoundRole(role: EUserRole | string): boolean {
  return (ORGANIZATION_BOUND_ROLES as readonly string[]).includes(role);
}

export function normalizeRolesByPriority(roles?: EUserRole[] | string[] | null): EUserRole[] {
  if (!roles?.length) {
    return [];
  }

  const valid = new Set(
    roles.filter((role): role is EUserRole => Object.values(EUserRole).includes(role as EUserRole)),
  );

  return ROLE_PRIORITY.filter((role) => valid.has(role));
}

export function resolveEffectiveRole(roles?: EUserRole[] | string[] | null): EUserRole | null {
  return normalizeRolesByPriority(roles)[0] ?? null;
}
