import type { EUserRole } from "@/common/enums/roles.enums";

export type TMockUserFixture = {
  email: string;
  name: string;
  role: EUserRole;
};
