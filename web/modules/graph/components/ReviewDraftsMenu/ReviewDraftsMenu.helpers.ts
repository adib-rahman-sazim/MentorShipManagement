import dayjs, { Dayjs } from "dayjs";
import pluralize from "pluralize";

import { DRAFT_STATUS_LABELS, UNTITLED_DRAFT_LABEL } from "@/modules/graph/draft.constants";
import { formatDraftDay, formatElapsed } from "@/modules/graph/review.helpers";
import { EMentorshipDraftStatus, IMentorshipDraftSummaryResponse } from "@/shared/typedefs";

import {
  ALWAYS_LOADED_STATUSES,
  CHANGE_NOUN,
  LOADING_DRAFTS_TEXT,
  META_SEPARATOR,
  NO_DRAFTS_TEXT,
  REVIEW_DRAFT_GROUPS,
  REVIEW_DRAFTS_PAGE_SIZE,
  WAITING_ACTIONS,
  YOU_LABEL,
} from "./ReviewDraftsMenu.constants";
import { EReviewDraftGroup } from "./ReviewDraftsMenu.enums";
import type {
  TDraftLimits,
  TDraftPages,
  TReviewDraftEntry,
  TReviewDraftGroup,
  TReviewDraftGroupConfig,
} from "./ReviewDraftsMenu.types";

export function isWaitingOnViewer({ allowedActions }: IMentorshipDraftSummaryResponse): boolean {
  return allowedActions.some((action) => WAITING_ACTIONS.includes(action));
}

function getLatestAt(draft: IMentorshipDraftSummaryResponse): string {
  return (
    draft.publishedAt ??
    draft.cancelledAt ??
    draft.decidedAt ??
    draft.submittedAt ??
    draft.updatedAt
  );
}

export function getDraftTimeLabel(draft: IMentorshipDraftSummaryResponse, now: Dayjs): string {
  switch (draft.status) {
    case EMentorshipDraftStatus.DRAFT:
      return `edited ${formatElapsed(draft.updatedAt, now)} ago`;
    case EMentorshipDraftStatus.IN_REVIEW:
    case EMentorshipDraftStatus.APPROVED:
      return `waiting ${formatElapsed(getLatestAt(draft), now)}`;
    default:
      return `${DRAFT_STATUS_LABELS[draft.status]} ${formatDraftDay(getLatestAt(draft))}`;
  }
}

export function toReviewDraftEntry(
  draft: IMentorshipDraftSummaryResponse,
  viewerId: string | null,
  now: Dayjs,
): TReviewDraftEntry {
  const author = draft.createdBy.id === viewerId ? YOU_LABEL : draft.createdBy.name;

  return {
    id: draft.id,
    title: draft.title.trim() || UNTITLED_DRAFT_LABEL,
    meta: [
      author,
      pluralize(CHANGE_NOUN, draft.itemCount, true),
      getDraftTimeLabel(draft, now),
    ].join(META_SEPARATOR),
    isWaiting: isWaitingOnViewer(draft),
  };
}

function isExpanded({ statuses }: TReviewDraftGroupConfig, limits: TDraftLimits): boolean {
  return statuses.every((status) => limits[status] !== undefined);
}

export function toReviewDraftGroup(
  config: TReviewDraftGroupConfig,
  pages: TDraftPages,
  limits: TDraftLimits,
  viewerId: string | null,
  now: Dayjs,
): TReviewDraftGroup {
  const loaded = config.statuses.flatMap((status) => pages[status]?.data ?? []);
  const total = config.statuses.reduce(
    (sum, status) => sum + (pages[status]?.meta.totalItems ?? 0),
    0,
  );
  const latestFirst = [...loaded].sort(
    (first, second) => dayjs(getLatestAt(second)).valueOf() - dayjs(getLatestAt(first)).valueOf(),
  );
  const shown = isExpanded(config, limits)
    ? latestFirst
    : latestFirst.slice(0, REVIEW_DRAFTS_PAGE_SIZE);

  return {
    group: config.group,
    label: config.label,
    entries: shown.map((draft) => toReviewDraftEntry(draft, viewerId, now)),
    total,
    canShowAll: total > shown.length,
  };
}

export function getReviewDraftGroups(
  pages: TDraftPages,
  limits: TDraftLimits,
  viewerId: string | null,
  now: Dayjs,
): TReviewDraftGroup[] {
  return REVIEW_DRAFT_GROUPS.map((config) =>
    toReviewDraftGroup(config, pages, limits, viewerId, now),
  );
}

export function getShowAllLimits(group: EReviewDraftGroup, pages: TDraftPages): TDraftLimits {
  const config = REVIEW_DRAFT_GROUPS.find((candidate) => candidate.group === group);

  return Object.fromEntries(
    (config?.statuses ?? []).map((status) => [
      status,
      Math.max(pages[status]?.meta.totalItems ?? 0, REVIEW_DRAFTS_PAGE_SIZE),
    ]),
  );
}

export function getWaitingBadge(pages: TDraftPages): string | null {
  const openPages = ALWAYS_LOADED_STATUSES.map((status) => pages[status]);
  const count = openPages.reduce(
    (sum, page) => sum + (page?.data.filter(isWaitingOnViewer).length ?? 0),
    0,
  );
  const hasMore = openPages.some((page) => page && page.meta.totalItems > page.data.length);

  if (count === 0) {
    return null;
  }

  return hasMore ? `${count}+` : `${count}`;
}

export function getMenuStatusText(isLoading: boolean, hasDrafts: boolean): string | null {
  if (isLoading) {
    return LOADING_DRAFTS_TEXT;
  }

  return hasDrafts ? null : NO_DRAFTS_TEXT;
}

export function getShowAllLabel(total: number): string {
  return `Show all ${total}`;
}

export function getWaitingBadgeLabel(badge: string): string {
  return `${badge} waiting on you`;
}
