import { DASHBOARD_ROUTE } from "@/shared/constants/routes.constants";
import type { TCanCheck } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import { EPermission } from "@/shared/typedefs";

import { DEFAULT_AUTHORIZED_ROUTE_CANDIDATES } from "./Unauthorized.constants";

export const getDefaultAuthorizedRoute = (can: TCanCheck): string => {
  for (const candidate of DEFAULT_AUTHORIZED_ROUTE_CANDIDATES) {
    if (can(EPermission.PAGE_VIEW, candidate.resource)) {
      return candidate.route;
    }
  }

  return DASHBOARD_ROUTE;
};
