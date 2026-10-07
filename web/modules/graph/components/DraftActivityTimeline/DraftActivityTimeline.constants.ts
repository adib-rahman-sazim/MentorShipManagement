import { EDraftActivityKind } from "./DraftActivityTimeline.enums";

export const ACTIVITY_HEADING = "Activity";
export const UNKNOWN_ACTOR_NAME = "someone";

export const ACTIVITY_VERBS: Record<EDraftActivityKind, string> = {
  [EDraftActivityKind.CREATED]: "Created",
  [EDraftActivityKind.SUBMITTED]: "Submitted",
  [EDraftActivityKind.APPROVED]: "Approved",
  [EDraftActivityKind.REJECTED]: "Rejected",
  [EDraftActivityKind.PUBLISHED]: "Published",
  [EDraftActivityKind.CANCELLED]: "Cancelled",
};
