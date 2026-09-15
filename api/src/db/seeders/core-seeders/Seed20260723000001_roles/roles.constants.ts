import { EUserRole } from "@/common/enums/roles.enums";

import type { TRoleSeedEntry } from "./roles.types";

export const ROLE_SEED: TRoleSeedEntry[] = [
  {
    code: EUserRole.SUPERADMIN,
    name: "Superadmin",
  },
  {
    code: EUserRole.SENSEI,
    name: "Sensei",
  },
  {
    code: EUserRole.MENTOR,
    name: "Mentor",
  },
  {
    code: EUserRole.MENTEE,
    name: "Mentee",
  },
];
