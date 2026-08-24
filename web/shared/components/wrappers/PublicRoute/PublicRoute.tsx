import { PropsWithChildren, useEffect, useState } from "react";

import { useRouter } from "next/router";

import AuthFormPageSkeleton from "@/shared/components/skeletons/AuthFormPageSkeleton";
import AuthLayout from "@/shared/layouts/AuthLayout";
import { useAuth } from "@/shared/providers/AuthProvider";
import { consumePostAuthRedirect, getPostAuthDestination } from "@/shared/utils/postAuthRedirect";

const PublicRoute = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasResolvedAuth(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || isRedirecting) {
      return;
    }

    if (isAuthenticated) {
      setIsRedirecting(true);
      router.replace(getPostAuthDestination(consumePostAuthRedirect()));
    }
  }, [router, isLoading, isAuthenticated, isRedirecting]);

  if ((!hasResolvedAuth && isLoading) || isRedirecting || isAuthenticated) {
    return (
      <AuthLayout>
        <AuthFormPageSkeleton />
      </AuthLayout>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;