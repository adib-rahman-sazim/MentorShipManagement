import type { EUserRole } from "@/common/enums/roles.enums";

export type TRoleSeedEntry = {
  slug: EUserRole;
  name: string;
  description: string;
};
