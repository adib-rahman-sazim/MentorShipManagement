import { EUserRole } from "@/common/enums/roles.enums";

export const ROLE_PRIORITY: readonly EUserRole[] = [
  EUserRole.SUPERADMIN,
  EUserRole.SENSEI,
  EUserRole.MENTOR,
  EUserRole.MENTEE,
] as const;