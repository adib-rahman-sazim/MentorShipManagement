import { EUserRole } from "@/common/enums/roles.enums";

import type { TMockUserFixture } from "./mock-users.types";

export const MOCK_USER_DEFAULT_PASSWORD = "Password123";

export const MOCK_USERS: TMockUserFixture[] = [
  {
    email: "manager@sazim.io",
    firstName: "Mock",
    lastName: "Manager",
    name: "Mock Manager",
    roleSlug: EUserRole.MANAGER,
    organizationBound: false,
    memberRole: null,
  },
  {
    email: "customer@sazim.io",
    firstName: "Mock",
    lastName: "Customer",
    name: "Mock Customer",
    roleSlug: EUserRole.CUSTOMER,
    organizationBound: true,
    memberRole: EUserRole.CUSTOMER,
  },
];
