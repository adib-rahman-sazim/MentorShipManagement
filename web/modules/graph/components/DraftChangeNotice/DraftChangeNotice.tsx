import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { DRAFT_OPERATION_DETAILS } from "@/modules/graph/draft.constants";
import { EDraftNoticeKind } from "@/modules/graph/draft.enums";
import { Button } from "@/shared/components/shadui/button";

import {
  IN_THIS_DRAFT_SUFFIX,
  MOVE_LINK_HINT,
  REMOVE_LINK_LABEL,
  UNDO_CHANGE_LABEL,
} from "./DraftChangeNotice.constants";
import { IDraftChangeNoticeProps } from "./DraftChangeNotice.interfaces";

const DraftChangeNotice = ({
  notice,
  isEditable,
  onUndo,
  onRemoveLink,
}: IDraftChangeNoticeProps) => {
  const details = notice.operation ? DRAFT_OPERATION_DETAILS[notice.operation] : null;
  let content: ReactNode = null;

  if (notice.kind === EDraftNoticeKind.CHANGED && details) {
    content = (
      <>
        <span className={cn("text-xs font-medium", details.textClassName)}>
          {details.glyph} {details.word} {IN_THIS_DRAFT_SUFFIX}
        </span>
        <p className="text-sm">{notice.text}</p>
        {isEditable ? (
          <Button variant="outline" size="sm" onClick={() => onUndo(notice.subordinateId)}>
            {UNDO_CHANGE_LABEL}
          </Button>
        ) : null}
      </>
    );
  } else if (notice.kind === EDraftNoticeKind.REMOVABLE && isEditable) {
    content = (
      <>
        <p className="text-xs text-muted-foreground">{MOVE_LINK_HINT}</p>
        <Button variant="outline" size="sm" onClick={() => onRemoveLink(notice.subordinateId)}>
          {REMOVE_LINK_LABEL}
        </Button>
      </>
    );
  } else if (notice.kind === EDraftNoticeKind.BLOCKED && isEditable) {
    content = <p className="text-xs text-muted-foreground">{notice.text}</p>;
  }

  return content ? (
    <div className="mx-5 mb-5 flex flex-col items-start gap-2">{content}</div>
  ) : null;
};

export default DraftChangeNotice;
