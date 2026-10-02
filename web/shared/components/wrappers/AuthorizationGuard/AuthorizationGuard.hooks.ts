import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";

import { IUseAuthorizationGuardParams } from "./AuthorizationGuard.interfaces";

export const useAuthorizationGuard = ({
  action,
  subject,
  conditions,
}: IUseAuthorizationGuardParams) => {
  const { isAllowed, isLoading } = useCan(action, subject, conditions);
  return { hasPermission: isAllowed, isLoading };
};
