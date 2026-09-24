export interface ICreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface IUseCreateUserFormParams {
  onSuccess: () => void;
}