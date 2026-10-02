import { ReactNode } from "react";

import type {
  TAppResource,
  TSubjectConditions,
} from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import { EPermission } from "@/shared/typedefs";

export interface IAuthorizationGuardBaseProps {
  children: ReactNode;
  action: EPermission;
  subject: TAppResource;
  conditions?: TSubjectConditions;
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

export interface IUseAuthorizationGuardParams {
  action: EPermission;
  subject: TAppResource;
  conditions?: TSubjectConditions;
}
