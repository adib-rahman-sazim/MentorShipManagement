import {
  CircleArrowUp,
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleX,
  Contrast,
  LucideIcon,
} from "lucide-react";

import { EMentorshipDraftStatus } from "@/shared/typedefs";

export const STATUS_LOZENGE_ICONS: Record<EMentorshipDraftStatus, LucideIcon> = {
  [EMentorshipDraftStatus.DRAFT]: CircleDashed,
  [EMentorshipDraftStatus.IN_REVIEW]: Contrast,
  [EMentorshipDraftStatus.APPROVED]: CircleCheck,
  [EMentorshipDraftStatus.REJECTED]: CircleX,
  [EMentorshipDraftStatus.PUBLISHED]: CircleArrowUp,
  [EMentorshipDraftStatus.CANCELLED]: CircleMinus,
};

export const STATUS_LOZENGE_CLASSES: Record<EMentorshipDraftStatus, string> = {
  [EMentorshipDraftStatus.DRAFT]:
    "border-status-draft-line bg-status-draft-bg text-status-draft-fg",
  [EMentorshipDraftStatus.IN_REVIEW]:
    "border-status-review-line bg-status-review-bg text-status-review-fg",
  [EMentorshipDraftStatus.APPROVED]:
    "border-status-approved-line bg-status-approved-bg text-status-approved-fg",
  [EMentorshipDraftStatus.REJECTED]:
    "border-status-rejected-line bg-status-rejected-bg text-status-rejected-fg",
  [EMentorshipDraftStatus.PUBLISHED]:
    "border-status-published-line bg-status-published-bg text-status-published-fg",
  [EMentorshipDraftStatus.CANCELLED]:
    "border-status-cancelled-line bg-transparent text-status-cancelled-fg",
};
