import {
  EPermission,
  EPermissionCode,
  EPermissionConditionType,
  EResource,
} from "./permissions.enums";
import type { IPermissionDefinition } from "./permissions.interfaces";

export const toPermissionDefinition = (
  code: EPermissionCode,
  resource: EResource,
  action: EPermission,
  description?: string,
): IPermissionDefinition => ({
  code,
  resource,
  action,
  conditionType: EPermissionConditionType.NONE,
  denied: false,
  description,
});
