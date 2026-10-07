import { Check, LucideIcon, Minus, X } from "lucide-react";

import { EDraftStage, EDraftStageState } from "./StageRail.enums";
import type { TCurrentStageClasses } from "./StageRail.types";

export const STAGE_RAIL_LABEL = "Workflow stage";

export const DRAFT_STAGES: readonly EDraftStage[] = [
  EDraftStage.DRAFT,
  EDraftStage.REVIEW,
  EDraftStage.APPROVAL,
  EDraftStage.PUBLISH,
];

export const STAGE_LABELS: Record<EDraftStage, string> = {
  [EDraftStage.DRAFT]: "Draft",
  [EDraftStage.REVIEW]: "Review",
  [EDraftStage.APPROVAL]: "Approval",
  [EDraftStage.PUBLISH]: "Publish",
};

export const STAGE_STATE_ICONS: Partial<Record<EDraftStageState, LucideIcon>> = {
  [EDraftStageState.DONE]: Check,
  [EDraftStageState.REJECTED]: X,
  [EDraftStageState.CANCELLED]: Minus,
};

export const STAGE_MARKER_CLASSES: Record<EDraftStageState, string> = {
  [EDraftStageState.DONE]: "bg-foreground text-background",
  [EDraftStageState.CURRENT]: "border-[0.1rem]",
  [EDraftStageState.UPCOMING]: "border-[0.1rem] border-dashed border-status-draft-line",
  [EDraftStageState.REJECTED]: "bg-status-rejected-fg text-background",
  [EDraftStageState.CANCELLED]:
    "border-[0.1rem] border-status-cancelled-line text-status-cancelled-fg",
};

export const STAGE_LABEL_CLASSES: Record<EDraftStageState, string> = {
  [EDraftStageState.DONE]: "font-medium",
  [EDraftStageState.CURRENT]: "font-medium",
  [EDraftStageState.UPCOMING]: "text-muted-foreground",
  [EDraftStageState.REJECTED]: "font-medium text-status-rejected-fg",
  [EDraftStageState.CANCELLED]: "text-muted-foreground",
};

export const CURRENT_STAGE_CLASSES: Record<EDraftStage, TCurrentStageClasses> = {
  [EDraftStage.DRAFT]: {
    marker: "border-status-draft-fg",
    dot: "bg-status-draft-fg",
    label: "text-status-draft-fg",
  },
  [EDraftStage.REVIEW]: {
    marker: "border-status-review-fg",
    dot: "bg-status-review-fg",
    label: "text-status-review-fg",
  },
  [EDraftStage.APPROVAL]: {
    marker: "border-status-approved-fg",
    dot: "bg-status-approved-fg",
    label: "text-status-approved-fg",
  },
  [EDraftStage.PUBLISH]: {
    marker: "border-status-approved-fg",
    dot: "bg-status-approved-fg",
    label: "text-status-approved-fg",
  },
};
