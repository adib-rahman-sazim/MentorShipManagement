import { ACTIVITY_HEADING } from "./DraftActivityTimeline.constants";
import { IDraftActivityTimelineProps } from "./DraftActivityTimeline.interfaces";

const DraftActivityTimeline = ({ entries }: IDraftActivityTimelineProps) => (
  <section>
    <h2 className="mb-2 text-base font-semibold">{ACTIVITY_HEADING}</h2>
    <ol className="border-b">
      {entries.map(({ kind, text, time }) => (
        <li
          key={kind}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t py-2 text-[0.8125rem] leading-5"
        >
          <span>{text}</span>
          <span className="font-mono text-xs text-muted-foreground">{time}</span>
        </li>
      ))}
    </ol>
  </section>
);

export default DraftActivityTimeline;
