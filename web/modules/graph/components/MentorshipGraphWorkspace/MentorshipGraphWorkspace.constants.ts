import type { TDraftItem } from "@/modules/graph/draft.types";

export const GRAPH_COMPACT_MEDIA_QUERY = "(width < 53.75rem)";
export const GRAPH_CENTER_DURATION_MS = 300;
export const CLEAR_SELECTION_KEY = "Escape";
export const NO_DRAFT_ITEMS: TDraftItem[] = [];
export const NO_STALE_IDS: ReadonlySet<string> = new Set();
