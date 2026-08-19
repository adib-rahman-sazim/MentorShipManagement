import type { EUserRole } from "@/common/enums/roles.enums";

export type TMockUserFixture = {
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  roleSlug: EUserRole;
  organizationBound: boolean;
  memberRole: EUserRole | null;
};
