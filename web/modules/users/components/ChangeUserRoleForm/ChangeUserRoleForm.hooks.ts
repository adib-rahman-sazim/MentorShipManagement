import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  useUpdateMemberRoleMutation,
  useUpdateSystemRolesMutation,
} from "@/shared/redux/rtk-apis/members/members.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import { SYSTEM_ROLES } from "./ChangeUserRoleForm.constants";
import {
  changeUserRoleDefaultValues,
  changeUserRoleValidationSchemaResolver,
} from "./ChangeUserRoleForm.helpers";
import type { TChangeUserRoleFormFields } from "./ChangeUserRoleForm.types";

export const useChangeUserRoleForm = ({
  userId,
  onSuccess,
  onError,
}: {
  userId?: string;
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const form = useForm<TChangeUserRoleFormFields>({
    defaultValues: changeUserRoleDefaultValues,
    mode: "onSubmit",
    resolver: changeUserRoleValidationSchemaResolver,
  });

  const [updateMemberRole, { reset: resetOrgMutation }] = useUpdateMemberRoleMutation();
  const [updateSystemRoles, { reset: resetSystemMutation }] = useUpdateSystemRolesMutation();

  const onSubmit = async (data: TChangeUserRoleFormFields) => {
    if (!userId) {
      return;
    }

    try {
      if (SYSTEM_ROLES.has(data.role)) {
        await updateSystemRoles({
          userId,
          roleSlugs: [data.role],
        }).unwrap();
      } else {
        await updateMemberRole({
          userId,
          roleSlugs: [data.role],
        }).unwrap();
      }

      form.reset();
      resetOrgMutation();
      resetSystemMutation();

      toast.success("User role updated successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError();
      }

      toast.error("Failed to update user role", {
        description: parseApiErrorMessage(error),
      });
    }
  };

  return {
    form,
    onSubmit,
  };
};
