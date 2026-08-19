import { Button } from "@/shared/components/shadui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadui/dialog";
import { Form } from "@/shared/components/shadui/form";
import { EUserState } from "@/shared/typedefs/api";

import { IToggleUserStateDialogProps } from "./ToggleUserStateDialog.interfaces";
import { useToggleUserStateForm } from "./ToggleUserStateForm.hooks";

const ToggleUserStateDialog = ({
  user,
  isOpen,
  onOpenChange,
  onCancel,
}: IToggleUserStateDialogProps) => {
  const { form, onSubmit } = useToggleUserStateForm({
    userId: user?.id,
    currentState: user?.state,
    onSuccess: () => {
      onOpenChange(false);
      onCancel();
    },
  });

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user.state === EUserState.ACTIVE ? "Deactivate" : "Activate"} User
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <p>
              Are you sure you want to{" "}
              {user.state === EUserState.ACTIVE ? "deactivate" : "activate"} user {user.email}?
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleUserStateDialog;
