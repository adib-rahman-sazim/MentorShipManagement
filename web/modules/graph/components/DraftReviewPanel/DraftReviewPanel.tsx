import dayjs from "dayjs";

import DraftActivityTimeline from "@/modules/graph/components/DraftActivityTimeline";
import { getDraftActivity } from "@/modules/graph/components/DraftActivityTimeline/DraftActivityTimeline.helpers";
import DraftChangeAlerts from "@/modules/graph/components/DraftChangeAlerts";
import DraftChangeRow from "@/modules/graph/components/DraftChangeRow";
import StageRail from "@/modules/graph/components/StageRail";
import { getDraftStages } from "@/modules/graph/components/StageRail/StageRail.helpers";
import { UNTITLED_DRAFT_LABEL } from "@/modules/graph/draft.constants";
import { getDraftByline } from "@/modules/graph/review.helpers";

import {
  CHANGES_HEADING,
  DECISION_NOTE_HEADING,
  LOADING_CHANGES_TEXT,
} from "./DraftReviewPanel.constants";
import { getDecisionCaption } from "./DraftReviewPanel.helpers";
import { IDraftReviewPanelProps } from "./DraftReviewPanel.interfaces";

const DraftReviewPanel = ({ review, onSelectPerson, decisionSlot }: IDraftReviewPanelProps) => {
  const { detail, changes } = review;

  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="flex flex-col gap-1 pr-8">
        <h2 className="text-base font-semibold">{detail.title.trim() || UNTITLED_DRAFT_LABEL}</h2>
        <p className="text-xs text-muted-foreground">{getDraftByline(detail)}</p>
      </header>
      <StageRail stages={getDraftStages(detail, dayjs())} />
      <section>
        <div className="flex items-baseline gap-2 pb-2">
          <h2 className="text-base font-semibold">{CHANGES_HEADING}</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {changes?.length ?? detail.itemCount}
          </span>
        </div>
        {changes ? (
          <ul className="divide-y border-y">
            {changes.map((change) => (
              <li key={change.subordinateId}>
                <DraftChangeRow change={change} isEditable={false} onSelect={onSelectPerson}>
                  <DraftChangeAlerts change={change} />
                </DraftChangeRow>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[0.8125rem] text-muted-foreground">{LOADING_CHANGES_TEXT}</p>
        )}
      </section>
      {detail.decisionComment ? (
        <figure className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold">{DECISION_NOTE_HEADING}</h2>
          <blockquote className="rounded-md bg-muted px-3 py-2 text-sm whitespace-pre-line">
            {detail.decisionComment}
          </blockquote>
          <figcaption className="text-xs text-muted-foreground">
            {getDecisionCaption(detail)}
          </figcaption>
        </figure>
      ) : null}
      {decisionSlot}
      <DraftActivityTimeline entries={getDraftActivity(detail)} />
    </div>
  );
};

export default DraftReviewPanel;
