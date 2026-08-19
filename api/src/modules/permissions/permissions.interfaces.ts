import type { EPermission, EPermissionConditionType, EResource } from "./permissions.enums";

export interface IPermissionDefinition {
  code: string;
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
  roles?: string[];
  activeOrganizationId?: string;
}

export interface IGetMyCaslRulesResult {
  rules: INormalizedCaslRule[];
}
