import { EPermissionCode, IUserPermissionEntryResponse } from "@/shared/typedefs";

import { EPermissionGroup } from "./permissions.enums";

export interface IPermissionDetails {
  label: string;
  description: string;
}

export interface IPermissionGroupDefinition {
  group: EPermissionGroup;
  title: string;
  description: string;
  codes: EPermissionCode[];
}

export interface IPermissionGroupView {
  group: EPermissionGroup;
  title: string;
  description: string;
  permissions: IUserPermissionEntryResponse[];
  grantedCount: number;
  totalCount: number;
}

export interface IPermissionSummary {
  total: number;
  granted: number;
  added: number;
  removed: number;
}
