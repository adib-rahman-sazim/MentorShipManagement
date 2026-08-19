import {
  EPermission,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";
import type {
  ICreatePermissionOptions,
  IParsedPermission,
} from "@/utils/permission-string/permission-string.interfaces";

import {
  PERMISSION_CONDITION_KEY,
  PERMISSION_DELIMITER,
  PERMISSION_EFFECT_ALLOW,
  PERMISSION_EFFECT_DENY,
  PERMISSION_KEY_VALUE_DELIMITER,
  PERMISSION_PARTS_WITH_CONDITION_COUNT,
  PERMISSION_PARTS_WITHOUT_CONDITION_COUNT,
} from "./permission-string.constants";

export function createPermission(
  resource: EResource | string,
  action: EPermission | string,
  options?: ICreatePermissionOptions,
): string {
  const conditionType = options?.conditionType;
  const effect = options?.denied ? PERMISSION_EFFECT_DENY : PERMISSION_EFFECT_ALLOW;

  if (!conditionType || conditionType === EPermissionConditionType.NONE) {
    return [resource, action, effect].join(PERMISSION_DELIMITER);
  }

  const conditionSegment = [PERMISSION_CONDITION_KEY, conditionType].join(
    PERMISSION_KEY_VALUE_DELIMITER,
  );

  return [resource, action, effect, conditionSegment].join(PERMISSION_DELIMITER);
}

export function parsePermissionString(permissionString: string): IParsedPermission {
  if (!permissionString || typeof permissionString !== "string") {
    throw new Error(`Invalid permission string: "${permissionString}"`);
  }

  const parts = permissionString.split(PERMISSION_DELIMITER);

  if (
    parts.length !== PERMISSION_PARTS_WITHOUT_CONDITION_COUNT &&
    parts.length !== PERMISSION_PARTS_WITH_CONDITION_COUNT
  ) {
    throw new Error(`Invalid permission string: "${permissionString}"`);
  }

  const validResources = Object.values(EResource) as string[];
  const validActions = Object.values(EPermission) as string[];
  const validConditionTypes = (Object.values(EPermissionConditionType) as string[]).filter(
    (conditionType) => conditionType !== EPermissionConditionType.NONE,
  );

  const resource = parts[0];
  const action = parts[1];
  const effect = parts[2];
  let conditionType = EPermissionConditionType.NONE;

  if (!resource || !action || !effect) {
    throw new Error(`Invalid permission string: "${permissionString}"`);
  }

  if (!validResources.includes(resource)) {
    throw new Error(`Invalid resource "${resource}" in permission string: "${permissionString}"`);
  }

  if (!validActions.includes(action)) {
    throw new Error(`Invalid action "${action}" in permission string: "${permissionString}"`);
  }

  if (effect !== PERMISSION_EFFECT_ALLOW && effect !== PERMISSION_EFFECT_DENY) {
    throw new Error(`Invalid effect "${effect}" in permission string: "${permissionString}"`);
  }

  if (parts.length === PERMISSION_PARTS_WITH_CONDITION_COUNT) {
    const conditionSegment = parts[3];
    const [key, value, ...rest] = conditionSegment.split(PERMISSION_KEY_VALUE_DELIMITER);

    if (!key || !value || rest.length > 0) {
      throw new Error(`Invalid permission string: "${permissionString}"`);
    }

    if (key !== PERMISSION_CONDITION_KEY) {
      throw new Error(`Invalid permission string: "${permissionString}"`);
    }

    if (!validConditionTypes.includes(value)) {
      throw new Error(
        `Invalid condition type "${value}" in permission string: "${permissionString}"`,
      );
    }

    conditionType = value as EPermissionConditionType;
  }

  return {
    resource: resource as EResource,
    action: action as EPermission,
    conditionType,
    denied: effect === PERMISSION_EFFECT_DENY,
  };
}

export function isValidPermissionString(permissionString: string): boolean {
  try {
    parsePermissionString(permissionString);
    return true;
  } catch {
    return false;
  }
}
