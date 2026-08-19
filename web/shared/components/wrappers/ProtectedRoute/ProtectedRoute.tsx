import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import CreateOrganizationPageSkeleton from "@/shared/components/skeletons/CreateOrganizationPageSkeleton";
import PageSkeleton from "@/shared/components/skeletons/PageSkeleton";
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from "@/shared/constants/app.constants";
import GeneralLayout from "@/shared/layouts/GeneralLayout";
import { useAuth } from "@/shared/providers/AuthProvider";

import Unauthorized from "../../Unauthorized";
import { getSignInUrlWithRedirectParam, isCreateOrganizationRoute } from "./ProtectedRoute.helpers";
import { TProtectedRouteProps } from "./ProtectedRoute.types";

const ProtectedRouteLoadingFallback = ({ pathname }: { pathname: string }) => {
  if (isCreateOrganizationRoute(pathname)) {
    return (
      <GeneralLayout>
        <div className="flex flex-1 items-center justify-center p-4">
          <CreateOrganizationPageSkeleton />
        </div>
      </GeneralLayout>
    );
  }

  return <PageSkeleton />;
};

const ProtectedRoute = ({ children }: TProtectedRouteProps) => {
  const router = useRouter();
  const { isLoading, isAuthenticated, refetch } = useAuth();
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [hasTriggeredRefetch, setHasTriggeredRefetch] = useState(false);
  const [waitingForRefetch, setWaitingForRefetch] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    setHasToken(!!token);
    setHasCheckedToken(true);
  }, []);

  useEffect(() => {
    if (hasCheckedToken && hasToken && !isAuthenticated && !isLoading && !hasTriggeredRefetch) {
      setHasTriggeredRefetch(true);
      setWaitingForRefetch(true);
      refetch();
    }
  }, [hasCheckedToken, hasToken, isAuthenticated, isLoading, hasTriggeredRefetch, refetch]);

  useEffect(() => {
    if (waitingForRefetch && !isLoading) {
      const timer = setTimeout(() => {
        setWaitingForRefetch(false);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [waitingForRefetch, isLoading]);

  useEffect(() => {
    if (isLoading || waitingForRefetch || !hasCheckedToken || typeof location === "undefined") {
      return;
    }
    if (hasToken && !hasTriggeredRefetch) {
      return;
    }

    if (!isAuthenticated && !hasToken) {
      const redirectTo = `${location.pathname}${location.search}`;
      router.push(getSignInUrlWithRedirectParam(redirectTo));
    }
  }, [
    router,
    isLoading,
    waitingForRefetch,
    isAuthenticated,
    hasCheckedToken,
    hasToken,
    hasTriggeredRefetch,
  ]);

  if (!hasCheckedToken) {
    return <ProtectedRouteLoadingFallback pathname={router.pathname} />;
  }

  if (isLoading || waitingForRefetch) {
    return <ProtectedRouteLoadingFallback pathname={router.pathname} />;
  }

  if (hasToken && !isAuthenticated && hasTriggeredRefetch) {
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    return <Unauthorized />;
  }

  if (!isAuthenticated) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
