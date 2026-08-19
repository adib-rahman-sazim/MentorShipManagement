import { EUserRole } from "@/common/enums/roles.enums";

export const SYSTEM_LEVEL_ROLES: readonly EUserRole[] = [
  EUserRole.SUPER_ADMIN,
  EUserRole.MANAGER,
] as const;

export const ORGANIZATION_BOUND_ROLES: readonly EUserRole[] = [EUserRole.CUSTOMER] as const;

export const ROLE_PRIORITY: EUserRole[] = [
  EUserRole.SUPER_ADMIN,
  EUserRole.MANAGER,
  EUserRole.CUSTOMER,
];
