import { EMentorshipDraftAction } from "@/shared/typedefs";

import { EDraftConflictKind } from "./decision.enums";

export type TDraftConflict = {
  draftId: string;
  action: EMentorshipDraftAction;
  kind: EDraftConflictKind;
  subordinateIds: string[];
};

export type TDraftNote = {
  draftId: string | null;
  text: string;
};
