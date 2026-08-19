export interface IInviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
}
