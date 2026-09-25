import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  EPermissionOverrideEffect,
  EPermissionSource,
  IUserPermissionEntryResponse,
  IUserPermissionOverrideDto,
} from "@/shared/typedefs";

import {
  HIDDEN_PERMISSION_CODES,
  OTHER_PERMISSION_GROUP,
  PERMISSION_GROUPS,
  UNSAVED_CHANGE_LABEL,
  UNSAVED_CHANGES_LABEL,
} from "./permissions.constants";
import type {
  IPermissionGroupDefinition,
  IPermissionGroupView,
  IPermissionSummary,
} from "./permissions.interfaces";
import type { TPermissionAccess, TUserPermissionsFormFields } from "./permissions.types";

export const userPermissionsValidationSchema = z.object({
  access: z.record(z.string(), z.boolean().optional()),
});

export const userPermissionsValidationSchemaResolver = zodResolver(userPermissionsValidationSchema);

export function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function getVisiblePermissions(
  permissions: IUserPermissionEntryResponse[],
): IUserPermissionEntryResponse[] {
  return permissions.filter((permission) => !HIDDEN_PERMISSION_CODES.includes(permission.code));
}

export function getUserPermissionsDefaultValues(
  permissions: IUserPermissionEntryResponse[],
): TUserPermissionsFormFields {
  return {
    access: Object.fromEntries(
      permissions.map((permission) => [permission.code, permission.effective]),
    ),
  };
}

export function isPermissionChecked(
  permission: IUserPermissionEntryResponse,
  access: TPermissionAccess,
): boolean {
  return access[permission.code] ?? permission.effective;
}

export function countPendingChanges(
  permissions: IUserPermissionEntryResponse[],
  access: TPermissionAccess,
): number {
  return permissions.filter(
    (permission) => isPermissionChecked(permission, access) !== permission.effective,
  ).length;
}

export function buildPermissionOverrides(
  permissions: IUserPermissionEntryResponse[],
  access: TPermissionAccess,
): IUserPermissionOverrideDto[] {
  return permissions.flatMap((permission) => {
    const isChecked = isPermissionChecked(permission, access);

    if (isChecked === permission.roleDefault) {
      return [];
    }

    return [
      {
        permissionCode: permission.code,
        effect: isChecked ? EPermissionOverrideEffect.ALLOW : EPermissionOverrideEffect.REVOKE,
      },
    ];
  });
}

export function summarizePermissions(
  permissions: IUserPermissionEntryResponse[],
): IPermissionSummary {
  return {
    total: permissions.length,
    granted: permissions.filter((permission) => permission.effective).length,
    added: permissions.filter((permission) => permission.source === EPermissionSource.GRANTED)
      .length,
    removed: permissions.filter((permission) => permission.source === EPermissionSource.REVOKED)
      .length,
  };
}

function toPermissionGroupView(
  { group, title, description }: IPermissionGroupDefinition,
  permissions: IUserPermissionEntryResponse[],
): IPermissionGroupView {
  return {
    group,
    title,
    description,
    permissions,
    grantedCount: permissions.filter((permission) => permission.effective).length,
    totalCount: permissions.length,
  };
}

export function groupPermissions(
  permissions: IUserPermissionEntryResponse[],
): IPermissionGroupView[] {
  const permissionsByCode = new Map(permissions.map((permission) => [permission.code, permission]));
  const groupedCodes = new Set(PERMISSION_GROUPS.flatMap((definition) => definition.codes));

  const groups = PERMISSION_GROUPS.map((definition) =>
    toPermissionGroupView(
      definition,
      definition.codes.flatMap((code) => permissionsByCode.get(code) ?? []),
    ),
  );
  const ungrouped = permissions.filter((permission) => !groupedCodes.has(permission.code));

  return [...groups, toPermissionGroupView(OTHER_PERMISSION_GROUP, ungrouped)].filter(
    (group) => group.totalCount > 0,
  );
}

export function formatUnsavedChangesLabel(count: number): string {
  return `${count} ${count === 1 ? UNSAVED_CHANGE_LABEL : UNSAVED_CHANGES_LABEL}`;
}
