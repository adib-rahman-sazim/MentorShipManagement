import {
  EPermission,
  EPermissionCode,
  EPermissionSource,
  EResource,
  IUserPermissionEntryResponse,
} from "@/shared/typedefs";

function buildPermissionEntry(
  overrides: Partial<IUserPermissionEntryResponse>,
): IUserPermissionEntryResponse {
  return {
    code: EPermissionCode.CAN_READ_USER,
    resource: EResource.USER,
    action: EPermission.READ,
    source: EPermissionSource.NONE,
    effective: false,
    roleDefault: false,
    ...overrides,
  };
}

export const FROM_ROLE = buildPermissionEntry({
  code: EPermissionCode.CAN_VIEW_DASHBOARD,
  resource: EResource.DASHBOARD,
  action: EPermission.PAGE_VIEW,
  source: EPermissionSource.ROLE,
  effective: true,
  roleDefault: true,
});

export const NOT_HELD = buildPermissionEntry({
  code: EPermissionCode.CAN_UPDATE_USER,
  action: EPermission.UPDATE,
});

export const ADDED = buildPermissionEntry({
  code: EPermissionCode.CAN_LIST_USERS,
  action: EPermission.LIST,
  source: EPermissionSource.GRANTED,
  effective: true,
});

export const REMOVED = buildPermissionEntry({
  code: EPermissionCode.CAN_READ_USER,
  source: EPermissionSource.REVOKED,
  roleDefault: true,
});

export const MANAGE_ALL = buildPermissionEntry({
  code: EPermissionCode.CAN_MANAGE_ALL,
  resource: EResource.ALL,
  action: EPermission.MANAGE,
});
