import { Control } from "react-hook-form";

import type { IPermissionGroupView } from "@/modules/users/permissions/permissions.interfaces";
import type {
  TPermissionAccess,
  TUserPermissionsFormFields,
} from "@/modules/users/permissions/permissions.types";

export interface IPermissionGroupCardProps {
  group: IPermissionGroupView;
  control: Control<TUserPermissionsFormFields>;
  access: TPermissionAccess;
  isReadOnly: boolean;
}
