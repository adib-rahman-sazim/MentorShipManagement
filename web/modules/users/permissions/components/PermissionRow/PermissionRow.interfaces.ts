import { Control } from "react-hook-form";

import type { TUserPermissionsFormFields } from "@/modules/users/permissions/permissions.types";
import { IUserPermissionEntryResponse } from "@/shared/typedefs";

export interface IPermissionRowProps {
  permission: IUserPermissionEntryResponse;
  control: Control<TUserPermissionsFormFields>;
  isChecked: boolean;
  isReadOnly: boolean;
}

export interface IPendingChangeBadgeProps {
  isChecked: boolean;
}
