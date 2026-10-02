import { IUserResponse } from "@/shared/typedefs";

export interface IToggleUserStateDialogProps {
  user?: IUserResponse | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}
