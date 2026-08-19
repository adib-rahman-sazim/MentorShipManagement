import { PropsWithChildren, useEffect, useState } from "react";

import { useRouter } from "next/router";

import AuthFormPageSkeleton from "@/shared/components/skeletons/AuthFormPageSkeleton";
import LandingPageSkeleton from "@/shared/components/skeletons/LandingPageSkeleton";
import SystemInvitePageSkeleton from "@/shared/components/skeletons/SystemInvitePageSkeleton";
import { VERIFY_ROUTE } from "@/shared/constants/routes.constants";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { useAuth } from "@/shared/providers/AuthProvider";
import { resolvePostAuthDestinationFromSession } from "@/shared/utils/postAuthDestination";
import { consumePostAuthRedirect } from "@/shared/utils/postAuthRedirect";

import { isHomeRoute, isSystemInviteAcceptRoute } from "./PublicRoute.helpers";

const PublicRoute = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isLoading, isAuthenticated, activeOrganizationId } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false);
  const shouldDeferToVerifyPage = router.pathname === VERIFY_ROUTE;

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedAuth(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || isRedirecting || shouldDeferToVerifyPage) {
      return;
    }

    if (isAuthenticated) {
      setIsRedirecting(true);
      void (async () => {
        const nextPath = await resolvePostAuthDestinationFromSession({
          storedRedirect: consumePostAuthRedirect(),
          activeOrganizationId,
        });
        router.replace(nextPath);
      })();
    }
  }, [
    router,
    isLoading,
    isAuthenticated,
    isRedirecting,
    shouldDeferToVerifyPage,
    activeOrganizationId,
  ]);

  if ((!hasResolvedAuth && isLoading) || isRedirecting) {
    if (isHomeRoute(router.pathname)) {
      return (
        <GeneralLayout>
          <div className="flex flex-1 items-center justify-center">
            <LandingPageSkeleton />
          </div>
        </GeneralLayout>
      );
    }

    if (isSystemInviteAcceptRoute(router.pathname)) {
      return (
        <GeneralLayout>
          <div className="flex flex-1 items-center justify-center p-4">
            <SystemInvitePageSkeleton />
          </div>
        </GeneralLayout>
      );
    }

    return (
      <GeneralLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <AuthFormPageSkeleton />
        </div>
      </GeneralLayout>
    );
  }

  if (isAuthenticated && !shouldDeferToVerifyPage) {
    return (
      <GeneralLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <AuthFormPageSkeleton />
        </div>
      </GeneralLayout>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
