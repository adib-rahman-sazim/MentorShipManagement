import { cn } from "@/lib/utils";
import DraftChangeAlerts from "@/modules/graph/components/DraftChangeAlerts";
import GraphDetailRow from "@/modules/graph/components/GraphDetailRow";
import { DRAFT_OPERATION_DETAILS } from "@/modules/graph/draft.constants";

import { AFTER_LABEL, BEFORE_LABEL, IN_THIS_DRAFT_SUFFIX } from "./ReviewChangeNotice.constants";
import { IReviewChangeNoticeProps } from "./ReviewChangeNotice.interfaces";

const ReviewChangeNotice = ({ change }: IReviewChangeNoticeProps) => {
  const details = DRAFT_OPERATION_DETAILS[change.operation];

  return (
    <div className="mx-5 mb-5 flex flex-col gap-2">
      <span className={cn("text-xs font-medium", details.textClassName)}>
        {details.glyph} {details.word} {IN_THIS_DRAFT_SUFFIX}
      </span>
      <dl className="border-t">
        <GraphDetailRow label={BEFORE_LABEL}>{change.fromName}</GraphDetailRow>
        <GraphDetailRow label={AFTER_LABEL}>{change.toName}</GraphDetailRow>
      </dl>
      {change.violations.map((violation) => (
        <span key={violation} className="text-xs text-destructive">
          {violation}
        </span>
      ))}
      <DraftChangeAlerts change={change} />
    </div>
  );
};

export default ReviewChangeNotice;
