import { IUserResponse } from "@/shared/redux/rtk-apis/users/users.interfaces";

export interface IToggleUserStateDialogProps {
  user?: IUserResponse | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}
