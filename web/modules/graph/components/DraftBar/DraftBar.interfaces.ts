import type { TOperationCounts } from "@/modules/graph/draft.types";
import { EMentorshipDraftStatus } from "@/shared/typedefs";

export interface IDraftBarProps {
  title: string;
  status: EMentorshipDraftStatus;
  byline: string | null;
  isEditable: boolean;
  counts: TOperationCounts;
  changeCount: number;
  onOpenChanges: () => void;
  onExit: () => void;
}
