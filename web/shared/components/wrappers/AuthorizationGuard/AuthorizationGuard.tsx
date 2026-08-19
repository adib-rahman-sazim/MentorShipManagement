import { useEffect } from "react";

import { useRouter } from "next/router";

import { useAuthorizationGuard } from "./AuthorizationGuard.hooks";
import { TAuthorizationGuardProps } from "./AuthorizationGuard.types";

const AuthorizationGuard = (props: TAuthorizationGuardProps) => {
  const { children, action, subject, conditions, loadingFallback } = props;
  const router = useRouter();

  const { hasPermission, isLoading } = useAuthorizationGuard({
    action,
    subject,
    conditions,
  });

  useEffect(() => {
    if (!isLoading && !hasPermission && "fallbackRoute" in props && props.fallbackRoute) {
      router.push(props.fallbackRoute);
    }
  }, [isLoading, hasPermission, props, router]);

  if (isLoading) {
    return <>{loadingFallback ?? null}</>;
  }

  if (!hasPermission) {
    if ("unauthorizedFallback" in props) {
      return <>{props.unauthorizedFallback}</>;
    }
    return null;
  }

  return <>{children}</>;
};

export default AuthorizationGuard;
