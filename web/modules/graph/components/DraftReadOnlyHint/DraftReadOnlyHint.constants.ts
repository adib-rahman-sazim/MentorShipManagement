import { EMentorshipDraftStatus } from "@/shared/typedefs";

export const READ_ONLY_HINTS: Record<EMentorshipDraftStatus, string> = {
  [EMentorshipDraftStatus.DRAFT]: "Read-only. Only the author can change this draft.",
  [EMentorshipDraftStatus.IN_REVIEW]: "Read-only while in review. Links can't be changed.",
  [EMentorshipDraftStatus.APPROVED]:
    "Approved and waiting to be published. Links can't be changed.",
  [EMentorshipDraftStatus.REJECTED]: "Rejected. The graph shows today's links.",
  [EMentorshipDraftStatus.PUBLISHED]: "Published. The graph shows today's links.",
  [EMentorshipDraftStatus.CANCELLED]: "Cancelled. The graph shows today's links.",
};
