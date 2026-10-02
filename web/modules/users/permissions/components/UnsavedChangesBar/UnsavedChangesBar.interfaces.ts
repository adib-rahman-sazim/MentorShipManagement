import { UseFormReturn } from "react-hook-form";

import type { TUserPermissionsFormFields } from "@/modules/users/permissions/permissions.types";

export interface IUnsavedChangesBarProps {
  form: UseFormReturn<TUserPermissionsFormFields>;
  pendingChangeCount: number;
  onDiscard: () => void;
}
