import { EUserRole } from "@/shared/redux/rtk-apis/roles/roles.enums";
import { IUserResponse } from "@/shared/redux/rtk-apis/users/users.interfaces";

export type TChangeUserRoleDialogProps = {
  user: IUserResponse | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  roles: EUserRole[];
  onCancel?: () => void;
};
