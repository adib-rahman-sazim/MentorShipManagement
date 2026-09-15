import { EUserRole } from "@/common/enums/roles.enums";

import type { TMockUserFixture } from "./mock-users.types";

export const MOCK_USER_DEFAULT_PASSWORD = "Password123";

export const MOCK_USER_EMAILS = {
  SUPERADMIN: "superadmin@sazim.io",
  SENSEI: "sensei@sazim.io",
  MENTOR: "mentor@sazim.io",
  MENTOR_TWO: "mentor2@sazim.io",
  MENTEE: "mentee@sazim.io",
  MENTEE_TWO: "mentee2@sazim.io",
  MENTEE_THREE: "mentee3@sazim.io",
} as const;

export const MOCK_USERS: TMockUserFixture[] = [
  {
    email: MOCK_USER_EMAILS.SUPERADMIN,
    name: "Mock Superadmin",
    role: EUserRole.SUPERADMIN,
  },
  {
    email: MOCK_USER_EMAILS.SENSEI,
    name: "Mock Sensei",
    role: EUserRole.SENSEI,
  },
  {
    email: MOCK_USER_EMAILS.MENTOR,
    name: "Mock Mentor",
    role: EUserRole.MENTOR,
  },
  {
    email: MOCK_USER_EMAILS.MENTOR_TWO,
    name: "Mock Mentor Two",
    role: EUserRole.MENTOR,
  },
  {
    email: MOCK_USER_EMAILS.MENTEE,
    name: "Mock Mentee",
    role: EUserRole.MENTEE,
  },
  {
    email: MOCK_USER_EMAILS.MENTEE_TWO,
    name: "Mock Mentee Two",
    role: EUserRole.MENTEE,
  },
  {
    email: MOCK_USER_EMAILS.MENTEE_THREE,
    name: "Mock Mentee Three",
    role: EUserRole.MENTEE,
  },
];
