import { EUserRole } from "@/common/enums/roles.enums";

import type { TRoleSeedEntry } from "./roles.types";

export const ROLE_SEED: TRoleSeedEntry[] = [
  {
    slug: EUserRole.SUPER_ADMIN,
    name: "Super Admin",
    description: "Platform super admin with full access; no organization required",
  },
  {
    slug: EUserRole.MANAGER,
    name: "Manager",
    description: "Platform manager; no organization required",
  },
  {
    slug: EUserRole.CUSTOMER,
    name: "Customer",
    description: "Organization-bound customer member",
  },
];
