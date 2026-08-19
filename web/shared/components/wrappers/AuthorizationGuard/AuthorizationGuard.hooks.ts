import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import { EPermission, EResource } from "@/shared/typedefs";

export const useAuthorizationGuard = ({
  action,
  subject,
  conditions,
}: {
  action: EPermission;
  subject: EResource | "all";
  conditions?: Record<string, unknown>;
}) => {
  const { isAllowed, isLoading } = useCan(action, subject, conditions);
  return { hasPermission: isAllowed, isLoading };
};
