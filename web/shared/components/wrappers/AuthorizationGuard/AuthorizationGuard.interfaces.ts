import { ReactNode } from "react";

import { EPermission, EResource } from "@/shared/typedefs";

export interface IAuthorizationGuardBaseProps {
  children: ReactNode;
  action: EPermission;
  subject: EResource | "all";
  conditions?: Record<string, unknown>;
  loadingFallback?: ReactNode;
}

export interface IAuthorizationGuardWithFallbackComponent extends IAuthorizationGuardBaseProps {
  unauthorizedFallback: ReactNode;
  fallbackRoute?: never;
}

export interface IAuthorizationGuardWithFallbackRoute extends IAuthorizationGuardBaseProps {
  fallbackRoute: string;
  unauthorizedFallback?: never;
}
