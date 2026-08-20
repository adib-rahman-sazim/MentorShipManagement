import { EUserRole } from "@/common/enums/roles.enums";

import type { TRoleSeedEntry } from "./roles.types";

export const ROLE_SEED: TRoleSeedEntry[] = [
  {
    slug: EUserRole.SUPERADMIN,
    name: "Superadmin",
    description: "Platform superadmin with full access",
  },
  {
    slug: EUserRole.SENSEI,
    name: "Sensei",
    description: "Programme lead who manages mentors and mentees",
  },
  {
    slug: EUserRole.MENTOR,
    name: "Mentor",
    description: "Mentor guiding assigned mentees",
  },
  {
    slug: EUserRole.MENTEE,
    name: "Mentee",
    description: "Mentee taking part in the programme",
  },
];
