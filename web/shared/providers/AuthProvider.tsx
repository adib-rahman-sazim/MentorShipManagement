import { createContext, useContext, useEffect, useRef, useState } from "react";

import { organization, useSession } from "@/shared/lib/auth-client";
import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";

import { TAuthContextType, TAuthProviderProps, TSessionData } from "./AuthProvider.types";

const AuthContext = createContext<TAuthContextType | null>(null);

export function AuthProvider({ children }: TAuthProviderProps) {
  const { data: sessionData, isPending: isLoading, refetch } = useSession();
  const hasSetOrgRef = useRef(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null);
  const [activeOrganizationRole, setActiveOrganizationRole] = useState<EUserRole | null>(null);

  const session = sessionData as TSessionData | null;

  useEffect(() => {
    const fetchActiveOrg = async () => {
      if (!session?.user || !session.user.emailVerified || isLoading) {
        return;
      }

      try {
        const fullOrgResult = await organization.getFullOrganization();
        if (fullOrgResult.data) {
          setActiveOrganizationId(fullOrgResult.data.id);
          const currentMember = fullOrgResult.data.members?.find(
            (member: { userId: string }) => member.userId === session.user.id,
          );
          if (currentMember?.role) {
            setActiveOrganizationRole(currentMember.role as EUserRole);
          }
        } else if (!hasSetOrgRef.current) {
          hasSetOrgRef.current = true;
          const orgsResult = await organization.list();
          const firstOrg = orgsResult.data?.[0];
          if (firstOrg) {
            await organization.setActive({ organizationId: firstOrg.id });
            refetch();
          }
        }
      } catch (error) {
        console.error("Failed to fetch active organization:", error);
      }
    };

    fetchActiveOrg();
  }, [session, isLoading, refetch]);

  const value: TAuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session?.user && session.user.emailVerified === true,
    activeOrganizationId,
    activeOrganizationRole,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): TAuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
