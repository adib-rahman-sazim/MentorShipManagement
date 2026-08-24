import { createContext, useContext, useMemo } from "react";

import { useSession } from "@/shared/lib/auth-client";
import { EUserState } from "@/shared/typedefs";

import { TAuthContextType, TAuthProviderProps, TSessionData } from "./AuthProvider.types";

const AuthContext = createContext<TAuthContextType | null>(null);

export function AuthProvider({ children }: TAuthProviderProps) {
  const { data: sessionData, isPending: isLoading, refetch } = useSession();

  const session = sessionData as TSessionData | null;

  const value = useMemo<TAuthContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      isAuthenticated: Boolean(session?.user) && session?.user.state !== EUserState.INACTIVE,
      refetch,
    }),
    [session, isLoading, refetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): TAuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
