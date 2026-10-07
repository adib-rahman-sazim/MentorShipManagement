import { useState } from "react";

import { skipToken } from "@reduxjs/toolkit/query";
import dayjs from "dayjs";

import { useAuth } from "@/shared/providers/AuthProvider";
import { useGetMentorshipDraftsQuery } from "@/shared/redux/rtk-apis/mentorship-drafts/mentorship-drafts.api";
import { EMentorshipDraftStatus } from "@/shared/typedefs";

import { FIRST_PAGE, REVIEW_DRAFTS_PAGE_SIZE } from "./ReviewDraftsMenu.constants";
import { EReviewDraftGroup } from "./ReviewDraftsMenu.enums";
import {
  getReviewDraftGroups,
  getShowAllLimits,
  getWaitingBadge,
} from "./ReviewDraftsMenu.helpers";
import type { TDraftLimits, TDraftPages } from "./ReviewDraftsMenu.types";

export const useReviewDraftGroups = (isOpen: boolean) => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<TDraftLimits>({});

  const argsFor = (status: EMentorshipDraftStatus, isNeeded: boolean) =>
    isNeeded
      ? { status, page: FIRST_PAGE, limit: limits[status] ?? REVIEW_DRAFTS_PAGE_SIZE }
      : skipToken;

  const inReview = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.IN_REVIEW, true));
  const approved = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.APPROVED, true));
  const mine = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.DRAFT, isOpen));
  const rejected = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.REJECTED, isOpen));
  const published = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.PUBLISHED, isOpen));
  const cancelled = useGetMentorshipDraftsQuery(argsFor(EMentorshipDraftStatus.CANCELLED, isOpen));

  const pages: TDraftPages = {
    [EMentorshipDraftStatus.IN_REVIEW]: inReview.data,
    [EMentorshipDraftStatus.APPROVED]: approved.data,
    [EMentorshipDraftStatus.DRAFT]: mine.data,
    [EMentorshipDraftStatus.REJECTED]: rejected.data,
    [EMentorshipDraftStatus.PUBLISHED]: published.data,
    [EMentorshipDraftStatus.CANCELLED]: cancelled.data,
  };

  return {
    groups: getReviewDraftGroups(pages, limits, user?.id ?? null, dayjs()),
    waitingBadge: getWaitingBadge(pages),
    isLoading: [inReview, approved, mine, rejected, published, cancelled].some(
      ({ isLoading }) => isLoading,
    ),
    showAll: (group: EReviewDraftGroup) =>
      setLimits((current) => ({ ...current, ...getShowAllLimits(group, pages) })),
  };
};
