import type { Dayjs } from "dayjs";

import { formatDraftDay, formatElapsed } from "@/modules/graph/review.helpers";
import { EMentorshipDraftStatus } from "@/shared/typedefs";

import { DRAFT_STAGES, STAGE_LABELS } from "./StageRail.constants";
import { EDraftStage, EDraftStageState } from "./StageRail.enums";
import type { TDraftStage, TDraftTimeline, TStageStop } from "./StageRail.types";

function stageIndex(stage: EDraftStage): number {
  return DRAFT_STAGES.indexOf(stage);
}

function getCancelledStage({ submittedAt, decidedAt }: TDraftTimeline): EDraftStage {
  if (decidedAt) {
    return EDraftStage.PUBLISH;
  }

  return submittedAt ? EDraftStage.REVIEW : EDraftStage.DRAFT;
}

export function getStageStop(timeline: TDraftTimeline): TStageStop {
  switch (timeline.status) {
    case EMentorshipDraftStatus.DRAFT:
      return { index: stageIndex(EDraftStage.DRAFT), state: EDraftStageState.CURRENT };
    case EMentorshipDraftStatus.IN_REVIEW:
      return { index: stageIndex(EDraftStage.REVIEW), state: EDraftStageState.CURRENT };
    case EMentorshipDraftStatus.APPROVED:
      return { index: stageIndex(EDraftStage.PUBLISH), state: EDraftStageState.CURRENT };
    case EMentorshipDraftStatus.REJECTED:
      return { index: stageIndex(EDraftStage.APPROVAL), state: EDraftStageState.REJECTED };
    case EMentorshipDraftStatus.PUBLISHED:
      return { index: DRAFT_STAGES.length, state: EDraftStageState.DONE };
    case EMentorshipDraftStatus.CANCELLED:
      return {
        index: stageIndex(getCancelledStage(timeline)),
        state: EDraftStageState.CANCELLED,
      };
  }
}

function getStageDate(stage: EDraftStage, timeline: TDraftTimeline): string | null {
  switch (stage) {
    case EDraftStage.DRAFT:
      return timeline.createdAt;
    case EDraftStage.REVIEW:
      return timeline.submittedAt;
    case EDraftStage.APPROVAL:
      return timeline.decidedAt;
    case EDraftStage.PUBLISH:
      return timeline.publishedAt;
  }
}

function getStageWaitStart(stage: EDraftStage, timeline: TDraftTimeline): string | null {
  return stage === EDraftStage.PUBLISH ? timeline.decidedAt : getStageDate(stage, timeline);
}

function getStageMeta(
  stage: EDraftStage,
  state: EDraftStageState,
  timeline: TDraftTimeline,
  now: Dayjs,
): string | null {
  let at: string | null = null;

  if (state === EDraftStageState.CURRENT) {
    const since = getStageWaitStart(stage, timeline);

    return since ? formatElapsed(since, now) : null;
  }

  if (state === EDraftStageState.CANCELLED) {
    at = timeline.cancelledAt;
  } else if (state !== EDraftStageState.UPCOMING) {
    at = getStageDate(stage, timeline);
  }

  return at ? formatDraftDay(at) : null;
}

function getStageState(index: number, stop: TStageStop): EDraftStageState {
  if (index < stop.index) {
    return EDraftStageState.DONE;
  }

  return index === stop.index ? stop.state : EDraftStageState.UPCOMING;
}

export function getDraftStages(timeline: TDraftTimeline, now: Dayjs): TDraftStage[] {
  const stop = getStageStop(timeline);

  return DRAFT_STAGES.map((stage, index) => {
    const state = getStageState(index, stop);

    return {
      stage,
      label: STAGE_LABELS[stage],
      state,
      meta: getStageMeta(stage, state, timeline, now),
    };
  });
}
