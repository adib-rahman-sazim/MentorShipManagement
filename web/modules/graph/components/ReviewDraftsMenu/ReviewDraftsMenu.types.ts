import {
  EMentorshipDraftStatus,
  IMentorshipDraftSummaryResponse,
  TPaginatedResponse,
} from "@/shared/typedefs";

import { EReviewDraftGroup } from "./ReviewDraftsMenu.enums";

export type TReviewDraftGroupConfig = {
  group: EReviewDraftGroup;
  label: string;
  statuses: readonly EMentorshipDraftStatus[];
};

export type TDraftPage = TPaginatedResponse<IMentorshipDraftSummaryResponse>;

export type TDraftPages = Partial<Record<EMentorshipDraftStatus, TDraftPage>>;

export type TDraftLimits = Partial<Record<EMentorshipDraftStatus, number>>;

export type TReviewDraftEntry = {
  id: string;
  title: string;
  meta: string;
  isWaiting: boolean;
};

export type TReviewDraftGroup = {
  group: EReviewDraftGroup;
  label: string;
  entries: TReviewDraftEntry[];
  total: number;
  canShowAll: boolean;
};
