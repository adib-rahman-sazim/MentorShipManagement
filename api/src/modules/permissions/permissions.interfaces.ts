import type { Permission } from "@/common/entities/permissions.entity";
import type { User } from "@/common/entities/users.entity";
import type { EUserRole } from "@/common/enums/roles.enums";

import type { ReplaceUserPermissionOverridesDto } from "./permissions.dtos";
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

export interface IResolvedPermissionCodes {
  allPermissions: Permission[];
  roleCodes: string[];
  effectiveCodes: string[];
  grantedCodes: string[];
  revokedCodes: string[];
  holdsAllManage: boolean;
}

export interface IUserPermissionsViewInput extends IResolvedPermissionCodes {
  user: User;
}

export interface IAllManageInput {
  roleCodes: string[];
  revokedCodes: string[];
}

export interface IPermissionSourceInput {
  effectiveCodes: Set<string>;
  grantedCodes: Set<string>;
  revokedCodes: Set<string>;
}

export interface IGetUserPermissionOverridesContext {
  userId: string;
  actorId: string;
  actorRole: EUserRole;
}

export interface IReplaceUserPermissionOverridesContext {
  userId: string;
  actorId: string;
  actorRole: EUserRole;
  dto: ReplaceUserPermissionOverridesDto;
}

export interface IRoleDefaultCodesInput {
  roleCodes: string[];
  allCodes: string[];
}

export interface IExpandedAllManageInput {
  roleCodes: string[];
  grantedCodes: string[];
}

export interface IEffectivePermissionsResult {
  permissions: Permission[];
  holdsAllManage: boolean;
}
