import type { IPermissionSummary } from "@/modules/users/permissions/permissions.interfaces";
import { IUserResponse } from "@/shared/typedefs";

export interface IUserPermissionsHeaderProps {
  user: IUserResponse;
  roleLabel: string;
  summary: IPermissionSummary;
}

export interface IPermissionStatProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}
