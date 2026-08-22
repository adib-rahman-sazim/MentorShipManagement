import type { EUserRole } from "@/common/enums/roles.enums";

export type TEnsureCredentialUserParams = {
  email: string;
  password: string;
  name: string;
  role: EUserRole;
};
