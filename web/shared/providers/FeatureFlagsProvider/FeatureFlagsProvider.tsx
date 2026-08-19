import { useEffect, useMemo } from "react";

import { useAuth } from "@/shared/providers/AuthProvider";

import { FeatureFlagsContext } from "./FeatureFlagsProvider.context";
import { createFeatureFlagsStrategy } from "./FeatureFlagsProvider.factory";
import { IFeatureFlagsProviderProps } from "./FeatureFlagsProvider.interfaces";

export function FeatureFlagsProvider({ children }: IFeatureFlagsProviderProps) {
  const { user, activeOrganizationId, activeOrganizationRole, isAuthenticated } = useAuth();

  const strategy = useMemo(() => createFeatureFlagsStrategy(), []);

  useEffect(() => {
    strategy?.init();
  }, [strategy]);

  useEffect(() => {
    if (!strategy) {
      return;
    }

    if (isAuthenticated && user?.id) {
      strategy.identify(user.id, {
        email: user.email,
        organizationId: activeOrganizationId,
        role: activeOrganizationRole,
      });
    } else {
      strategy.reset();
    }
  }, [
    strategy,
    isAuthenticated,
    user?.id,
    user?.email,
    activeOrganizationId,
    activeOrganizationRole,
  ]);

  return <FeatureFlagsContext.Provider value={strategy}>{children}</FeatureFlagsContext.Provider>;
}
