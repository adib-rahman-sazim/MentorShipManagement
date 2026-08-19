import { ReactNode } from "react";

import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { EUserState } from "@/shared/typedefs/api";

export type TSessionUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  name: string;
  image?: string | null;
  state: EUserState;
  createdAt: Date;
  updatedAt: Date;
};

export type TSessionData = {
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
  user: TSessionUser;
};

export type TAuthContextType = {
  session: TSessionData | null;
  user: TSessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeOrganizationId: string | null;
  activeOrganizationRole: EUserRole | null;
  refetch: () => void;
};

export type TAuthProviderProps = {
  children: ReactNode;
};
