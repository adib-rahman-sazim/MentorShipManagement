import {
  EPermission,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";

export interface ICreatePermissionOptions {
  conditionType?: EPermissionConditionType;
  denied?: boolean;
}

export interface IParsedPermission {
  resource: EResource;
  action: EPermission;
  conditionType: EPermissionConditionType;
  denied: boolean;
}
