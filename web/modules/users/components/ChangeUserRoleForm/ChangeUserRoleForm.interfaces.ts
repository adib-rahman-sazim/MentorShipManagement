import { UseFormReturn } from "react-hook-form";

import { EUserRole } from "@/shared/typedefs";

import { TChangeUserRoleFormFields } from "./ChangeUserRoleForm.types";

export interface IUseChangeUserRoleFormParams {
  userId?: string;
  currentRole?: EUserRole;
  onSuccess?: () => void;
  onError?: () => void;
}

export interface IChangeUserRoleFormFieldsProps {
  form: UseFormReturn<TChangeUserRoleFormFields>;
}