import type { EUserRole } from "@/common/enums/roles.enums";

import type {
  EPermission,
  EPermissionCode,
  EPermissionConditionType,
  EResource,
} from "./permissions.enums";

export interface IPermissionDefinition {
  code: EPermissionCode;
  resource: EResource;
  action: EPermission;
  conditionType: EPermissionConditionType;
  denied: boolean;
  description?: string;
}

export interface INormalizedCaslRule {
  action: EPermission[];
  subject: Array<EResource | "all">;
  conditions?: Record<string, unknown>;
  inverted?: boolean;
  reason?: string;
  fields?: string[];
}

export interface IGetMyCaslRulesContext {
  userId: string;
  role?: string;
}

export interface IGetMyCaslRulesResult {
  rules: INormalizedCaslRule[];
}

export interface IEffectivePermissionsContext {
  userId: string;
  role: EUserRole;
}

export interface IEffectivePermissionCodesInput {
  roleCodes: string[];
  grantedCodes: string[];
  revokedCodes: string[];
  allCodes: string[];
}
