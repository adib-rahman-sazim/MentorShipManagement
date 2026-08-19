import { EUserState } from "@/common/enums/users.enums";

export type TSessionPayload = {
  user: {
    id: string;
    state: EUserState;
  };
  session: {
    id: string;
    activeOrganizationId: string | null;
  };
};
