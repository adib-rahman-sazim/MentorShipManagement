import { EUserRole } from "@/common/enums/roles.enums";

import type { TMockUserFixture } from "./mock-users.types";

export const MOCK_USER_DEFAULT_PASSWORD = "Password123";

export const MOCK_USERS: TMockUserFixture[] = [
  {
    email: "superadmin@sazim.io",
    name: "Mock Superadmin",
    role: EUserRole.SUPERADMIN,
  },
  {
    email: "sensei@sazim.io",
    name: "Mock Sensei",
    role: EUserRole.SENSEI,
  },
  {
    email: "mentor@sazim.io",
    name: "Mock Mentor",
    role: EUserRole.MENTOR,
  },
  {
    email: "mentee@sazim.io",
    name: "Mock Mentee",
    role: EUserRole.MENTEE,
  },
];
