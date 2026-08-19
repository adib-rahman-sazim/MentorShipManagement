import { createPermission } from "@/utils/permission-string/permission-string.helpers";

import { EPermission, EPermissionConditionType, EResource } from "./permissions.enums";
import type { IPermissionDefinition } from "./permissions.interfaces";

export const toPermissionDefinition = (
  resource: EResource,
  action: EPermission,
  description?: string,
): IPermissionDefinition => ({
  code: createPermission(resource, action),
  resource,
  action,
  conditionType: EPermissionConditionType.NONE,
  denied: false,
  description,
});

export const permissionCodesFromPairs = (...pairs: Array<[EResource, EPermission]>): string[] =>
  pairs.map(([resource, action]) => createPermission(resource, action));
