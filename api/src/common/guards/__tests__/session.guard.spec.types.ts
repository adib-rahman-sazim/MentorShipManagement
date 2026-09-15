import type { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

export type TSessionPayload = {
  user: {
    id: string;
    state: EUserState;
    role: EUserRole;
    deletedAt?: Date | null;
  };
  session: {
    id: string;
  };
};
