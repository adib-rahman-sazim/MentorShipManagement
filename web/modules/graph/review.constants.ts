import { EMentorshipDraftStatus } from "@/shared/typedefs";

export const CLOSED_DRAFT_STATUSES: readonly EMentorshipDraftStatus[] = [
  EMentorshipDraftStatus.REJECTED,
  EMentorshipDraftStatus.PUBLISHED,
  EMentorshipDraftStatus.CANCELLED,
];

export const DRAFT_DAY_FORMAT = "D MMM";
export const DRAFT_DATE_TIME_FORMAT = "D MMM HH:mm";

export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

export const STALE_EDGE_CLASS = "draft-edge-stale";
export const STALE_CHANGE_LABEL = "Out of date";
