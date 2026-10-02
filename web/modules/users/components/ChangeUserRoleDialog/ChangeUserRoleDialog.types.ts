import { IUserResponse } from "@/shared/typedefs";

export type TChangeUserRoleDialogProps = {
  user: IUserResponse | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCancel?: () => void;
};
