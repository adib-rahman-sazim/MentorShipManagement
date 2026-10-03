import type { TDraftContext } from "@/modules/graph/draft.types";

export interface IDraftConnectionHintProps {
  context: TDraftContext;
  movingSubordinateId: string | null;
}
