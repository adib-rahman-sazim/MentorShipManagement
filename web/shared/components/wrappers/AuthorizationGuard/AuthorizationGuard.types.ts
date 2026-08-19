import {
  IAuthorizationGuardWithFallbackComponent,
  IAuthorizationGuardWithFallbackRoute,
} from "./AuthorizationGuard.interfaces";

export type TAuthorizationGuardProps =
  | IAuthorizationGuardWithFallbackComponent
  | IAuthorizationGuardWithFallbackRoute;
