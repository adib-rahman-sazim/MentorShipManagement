import { IMentorshipDraftDetailResponse, IMentorshipDraftPersonResponse } from "@/shared/typedefs";

import { EDraftActivityKind } from "./DraftActivityTimeline.enums";

export type TDraftActivitySource = Pick<
  IMentorshipDraftDetailResponse,
  | "createdAt"
  | "createdBy"
  | "submittedAt"
  | "decidedAt"
  | "approvedBy"
  | "reviewedBy"
  | "publishedAt"
  | "publishedBy"
  | "cancelledAt"
  | "cancelledBy"
>;

export type TDraftActivityEvent = {
  kind: EDraftActivityKind;
  at: string | null;
  actor: IMentorshipDraftPersonResponse | null;
};

export type TDraftActivityEntry = {
  kind: EDraftActivityKind;
  text: string;
  time: string;
};
