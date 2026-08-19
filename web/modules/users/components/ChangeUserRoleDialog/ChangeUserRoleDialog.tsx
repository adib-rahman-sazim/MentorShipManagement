import { Button } from "@/shared/components/shadui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadui/dialog";
import { Form } from "@/shared/components/shadui/form";

import { useChangeUserRoleForm } from "../ChangeUserRoleForm/ChangeUserRoleForm.hooks";
import ChangeUserRoleFormFields from "../ChangeUserRoleForm/ChangeUserRoleFormFields";
import { TChangeUserRoleDialogProps } from "./ChangeUserRoleDialog.types";

const ChangeUserRoleDialog = ({
  user,
  isOpen,
  onOpenChange,
  roles,
  onCancel,
}: TChangeUserRoleDialogProps) => {
  const { form, onSubmit } = useChangeUserRoleForm({
    userId: user?.id,
    onSuccess: () => onOpenChange(false),
  });

  const handleOnCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ChangeUserRoleFormFields form={form} roles={roles} />

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={handleOnCancel} type="button">
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeUserRoleDialog;
