import type { TDraftConflict } from "./decision.types";

export interface IDraftDecisions {
  note: string;
  conflict: TDraftConflict | null;
  isBusy: boolean;
  setNote: (note: string) => void;
  approve: () => Promise<void>;
  reject: () => Promise<void>;
  publish: () => Promise<void>;
  cancel: () => Promise<void>;
}
