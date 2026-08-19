import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

export const SYSTEM_ROLES = new Set<EUserRole>([EUserRole.SUPER_ADMIN, EUserRole.MANAGER]);
