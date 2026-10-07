import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/shadui/alert-dialog";
import { Button } from "@/shared/components/shadui/button";

import {
  CANCEL_DRAFT_DESCRIPTION,
  CANCEL_DRAFT_LABEL,
  CANCEL_DRAFT_TITLE,
  KEEP_DRAFT_LABEL,
} from "./CancelDraftDialog.constants";
import { ICancelDraftDialogProps } from "./CancelDraftDialog.interfaces";

const CancelDraftDialog = ({ isBusy, onConfirm }: ICancelDraftDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        disabled={isBusy}
        render={<Button variant="ghost" size="sm" className="self-start text-destructive" />}
      >
        {CANCEL_DRAFT_LABEL}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{CANCEL_DRAFT_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{CANCEL_DRAFT_DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>{KEEP_DRAFT_LABEL}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isBusy} onClick={handleConfirm}>
            {CANCEL_DRAFT_LABEL}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CancelDraftDialog;
