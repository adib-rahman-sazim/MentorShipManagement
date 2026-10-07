import { IMentorshipDraftDetailResponse } from "@/shared/typedefs";

import { EDraftStage, EDraftStageState } from "./StageRail.enums";

export type TDraftTimeline = Pick<
  IMentorshipDraftDetailResponse,
  "status" | "createdAt" | "submittedAt" | "decidedAt" | "publishedAt" | "cancelledAt"
>;

export type TDraftStage = {
  stage: EDraftStage;
  label: string;
  state: EDraftStageState;
  meta: string | null;
};

export type TStageStop = {
  index: number;
  state: EDraftStageState;
};

export type TCurrentStageClasses = {
  marker: string;
  dot: string;
  label: string;
};
