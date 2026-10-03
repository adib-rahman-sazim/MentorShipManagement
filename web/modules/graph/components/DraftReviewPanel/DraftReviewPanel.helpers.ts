import { formatDraftDateTime } from "@/modules/graph/review.helpers";
import { IMentorshipDraftDetailResponse } from "@/shared/typedefs";

import { APPROVED_VERB, REJECTED_VERB } from "./DraftReviewPanel.constants";

export function getDecisionCaption({
  approvedBy,
  reviewedBy,
  decidedAt,
}: Pick<IMentorshipDraftDetailResponse, "approvedBy" | "reviewedBy" | "decidedAt">): string {
  const verb = approvedBy ? APPROVED_VERB : REJECTED_VERB;
  const decider = approvedBy ?? reviewedBy;
  const parts = [decider ? `${verb} by ${decider.name}` : verb];

  if (decidedAt) {
    parts.push(formatDraftDateTime(decidedAt));
  }

  return parts.join(" · ");
}
