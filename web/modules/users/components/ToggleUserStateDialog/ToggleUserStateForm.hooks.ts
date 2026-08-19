import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateUserMutation } from "@/shared/redux/rtk-apis/users/users.api";
import { EUserState } from "@/shared/typedefs/api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const useToggleUserStateForm = ({
  userId,
  currentState,
  onSuccess,
}: {
  userId?: string;
  currentState?: EUserState;
  onSuccess?: () => void;
}) => {
  const form = useForm();
  const [updateUser] = useUpdateUserMutation();

  const onSubmit = async () => {
    if (!userId || !currentState) {
      return;
    }

    try {
      await updateUser({
        id: userId,
        state: currentState === EUserState.ACTIVE ? EUserState.INACTIVE : EUserState.ACTIVE,
      }).unwrap();

      toast.success(
        `User ${currentState === EUserState.ACTIVE ? "deactivated" : "activated"} successfully`,
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        `Failed to ${currentState === EUserState.ACTIVE ? "deactivate" : "activate"} user`,
        {
          description: parseApiErrorMessage(error),
        },
      );
    }
  };

  return {
    form,
    onSubmit,
  };
};
