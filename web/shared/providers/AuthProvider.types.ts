import { ReactNode } from "react";

import { EUserState } from "@/shared/typedefs";

export type TSessionUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  state: EUserState;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
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
  refetch: () => void;
};

export type TAuthProviderProps = {
  children: ReactNode;
};
