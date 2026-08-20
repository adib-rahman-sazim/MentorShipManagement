import type { TMockUserFixture } from "./mock-users.types";

export const MOCK_USER_DEFAULT_PASSWORD = "Password123";

export const MOCK_USERS: TMockUserFixture[] = [
  {
    email: "mentor@sazim.io",
    firstName: "Mock",
    lastName: "Mentor",
    name: "Mock Mentor",
  },
  {
    email: "mentee@sazim.io",
    firstName: "Mock",
    lastName: "Mentee",
    name: "Mock Mentee",
  },
];
