import dayjs, { Dayjs } from "dayjs";

import { USER_ROLE_LABELS } from "@/modules/users/users.constants";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  IMentorshipDraftChangeSummaryItemResponse,
  IMentorshipDraftChangeSummaryResponse,
  IMentorshipDraftDetailResponse,
} from "@/shared/typedefs";

import { NO_MENTOR_NAME, VIOLATION_LABELS } from "./draft.constants";
import { getChangeSentence } from "./draft.helpers";
import type { TDraftEdge, TDraftItem, TDraftViolations } from "./draft.types";
import { EGraphNodeType } from "./graph.enums";
import type { TGraphNode } from "./graph.types";
import {
  CLOSED_DRAFT_STATUSES,
  DRAFT_DATE_TIME_FORMAT,
  DRAFT_DAY_FORMAT,
  HOURS_PER_DAY,
  MINUTES_PER_HOUR,
  STALE_CHANGE_LABEL,
  STALE_EDGE_CLASS,
} from "./review.constants";
import type { TDraftReview, TReviewChange } from "./review.types";

export function isClosedDraft(status: EMentorshipDraftStatus): boolean {
  return CLOSED_DRAFT_STATUSES.includes(status);
}

export function formatElapsed(since: string, now: Dayjs): string {
  const totalMinutes = Math.max(now.diff(dayjs(since), "minute"), 0);
  const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const days = Math.floor(totalHours / HOURS_PER_DAY);
  const hours = totalHours % HOURS_PER_DAY;
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function formatDraftDay(at: string): string {
  return dayjs(at).format(DRAFT_DAY_FORMAT);
}

export function formatDraftDateTime(at: string): string {
  return dayjs(at).format(DRAFT_DATE_TIME_FORMAT);
}

export function getDraftByline({
  createdBy,
  submittedAt,
}: Pick<IMentorshipDraftDetailResponse, "createdBy" | "submittedAt">): string {
  return submittedAt
    ? `By ${createdBy.name} · submitted ${formatDraftDateTime(submittedAt)}`
    : `By ${createdBy.name}`;
}

export function toReviewChanges(
  items: readonly IMentorshipDraftChangeSummaryItemResponse[],
  isOpen: boolean,
): TReviewChange[] {
  return items.map((item) => {
    const name = item.subordinate.name;
    const fromName = item.expectedSupervisor?.name ?? NO_MENTOR_NAME;
    const toName = item.proposedSupervisor?.name ?? NO_MENTOR_NAME;

    return {
      subordinateId: item.subordinate.id,
      operation: item.operation,
      name,
      roleLabel: USER_ROLE_LABELS[item.subordinate.role],
      fromName,
      toName,
      sentence: getChangeSentence(item.operation, name, fromName, toName),
      violations: isOpen ? item.violations.map((violation) => VIOLATION_LABELS[violation]) : [],
      stale:
        isOpen && item.stale
          ? {
              currentSupervisorName: item.currentSupervisor?.name ?? null,
              changedByDraftId: item.stale.changedByDraftId,
            }
          : null,
      overlaps: isOpen ? item.overlaps : [],
    };
  });
}

function toReviewViolations(
  items: readonly IMentorshipDraftChangeSummaryItemResponse[],
): TDraftViolations {
  return Object.fromEntries(
    items
      .filter(({ violations }) => violations.length > 0)
      .map(({ subordinate, violations }) => [subordinate.id, violations]),
  );
}

export function getDraftReview(
  detail: IMentorshipDraftDetailResponse,
  summary: IMentorshipDraftChangeSummaryResponse | undefined,
): TDraftReview {
  const isClosed = isClosedDraft(detail.status);
  const changes = summary ? toReviewChanges(summary.items, !isClosed) : null;

  return {
    detail,
    isClosed,
    changes,
    violations: summary && !isClosed ? toReviewViolations(summary.items) : {},
    staleIds: new Set(
      (changes ?? [])
        .filter(({ stale }) => stale !== null)
        .map(({ subordinateId }) => subordinateId),
    ),
  };
}

function marksStaleChange(edge: TDraftEdge): boolean {
  return (
    Boolean(edge.data?.isProposed) || edge.data?.operation === EMentorshipDraftOperation.UNASSIGN
  );
}

export function withStaleEdges(edges: TDraftEdge[], staleIds: ReadonlySet<string>): TDraftEdge[] {
  return edges.map((edge) =>
    staleIds.has(edge.target) && marksStaleChange(edge)
      ? {
          ...edge,
          className: [edge.className, STALE_EDGE_CLASS].filter(Boolean).join(" "),
          label: STALE_CHANGE_LABEL,
        }
      : edge,
  );
}

export function withReviewMarks(
  nodes: TGraphNode[],
  items: readonly TDraftItem[],
  staleIds: ReadonlySet<string>,
): TGraphNode[] {
  const operationBySubordinate = new Map(items.map((item) => [item.subordinateId, item.operation]));

  return nodes.map((node) => {
    const operation = operationBySubordinate.get(node.id);

    return node.type === EGraphNodeType.PERSON && node.data.draft && operation
      ? {
          ...node,
          data: {
            ...node.data,
            draft: { ...node.data.draft, operation, isStale: staleIds.has(node.id) },
          },
        }
      : node;
  });
}
