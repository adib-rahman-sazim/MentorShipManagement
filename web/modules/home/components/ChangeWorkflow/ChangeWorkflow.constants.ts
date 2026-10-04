import { EDraftStage } from "@/modules/graph/components/StageRail/StageRail.enums";

export const WORKFLOW_SECTION_ID = "workflow";
export const WORKFLOW_HEADING = "Every change is reviewed before it goes live.";

export const WORKFLOW_STAGE_DESCRIPTIONS: Record<EDraftStage, string> = {
  [EDraftStage.DRAFT]:
    "Propose new mentors, reassignments or removals on the graph. The live hierarchy stays as it is.",
  [EDraftStage.REVIEW]:
    "A reviewer other than the author checks every change. Stale and overlapping edits are flagged.",
  [EDraftStage.APPROVAL]: "The reviewer approves the draft, or rejects it with a comment.",
  [EDraftStage.PUBLISH]:
    "The Superadmin publishes approved drafts, and the live hierarchy updates for everyone.",
};

export const WORKFLOW_MARKER_CLASSES: Record<EDraftStage, string> = {
  [EDraftStage.DRAFT]: "border-status-draft-fg bg-status-draft-bg",
  [EDraftStage.REVIEW]: "border-status-review-fg bg-status-review-bg",
  [EDraftStage.APPROVAL]: "border-status-approved-fg bg-status-approved-bg",
  [EDraftStage.PUBLISH]: "border-status-published-fg bg-status-published-bg",
};
