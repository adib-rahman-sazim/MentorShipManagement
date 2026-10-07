import { useState } from "react";

import { CircleArrowUp } from "lucide-react";

import DraftOperationBadge from "@/modules/graph/components/DraftOperationBadge";
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
  KEEP_REVIEWING_LABEL,
  LOADING_CHANGES_TEXT,
  PUBLISH_DESCRIPTION,
} from "./PublishConfirm.constants";
import { getPublishLabel, getPublishTitle } from "./PublishConfirm.helpers";
import { IPublishConfirmProps } from "./PublishConfirm.interfaces";

const PublishConfirm = ({ changes, changeCount, isBusy, onConfirm }: IPublishConfirmProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const label = getPublishLabel(changeCount);

  const handleConfirm = async () => {
    await onConfirm();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger disabled={isBusy} render={<Button className="w-full" />}>
        <CircleArrowUp />
        {label}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getPublishTitle(changeCount)}</AlertDialogTitle>
          <AlertDialogDescription>{PUBLISH_DESCRIPTION}</AlertDialogDescription>
        </AlertDialogHeader>
        {changes ? (
          <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto text-sm">
            {changes.map((change) => (
              <li key={change.subordinateId} className="flex items-start gap-2">
                <DraftOperationBadge operation={change.operation} />
                <span>{change.sentence}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{LOADING_CHANGES_TEXT}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBusy}>{KEEP_REVIEWING_LABEL}</AlertDialogCancel>
          <AlertDialogAction disabled={isBusy || !changes} onClick={handleConfirm}>
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PublishConfirm;
