import { ComponentProps } from "react";

import PageSkeleton from "@/shared/components/skeletons/PageSkeleton";
import Unauthorized from "@/shared/components/Unauthorized/Unauthorized";
import AuthorizationGuard from "@/shared/components/wrappers/AuthorizationGuard";
import { TProtectedRouteProps } from "@/shared/components/wrappers/ProtectedRoute/ProtectedRoute.types";
import type { TAppResource } from "@/shared/providers/AbilityProvider";
import { EPermission } from "@/shared/typedefs";

export const withPermissionGuard = (
  ProtectedRoute: React.ComponentType<TProtectedRouteProps>,
  action: EPermission,
  subject: TAppResource,
) => {
  function Wrapper(props: ComponentProps<typeof ProtectedRoute>) {
    return (
      <ProtectedRoute>
        <AuthorizationGuard
          action={action}
          subject={subject}
          loadingFallback={<PageSkeleton />}
          unauthorizedFallback={<Unauthorized />}
        >
          {props.children}
        </AuthorizationGuard>
      </ProtectedRoute>
    );
  }
  Wrapper.displayName = `withPermissionGuard(${ProtectedRoute.displayName || ProtectedRoute.name || "Component"})`;
  return Wrapper;
};
