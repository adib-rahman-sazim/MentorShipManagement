import { cn } from "@/lib/utils";

import {
  CURRENT_STAGE_CLASSES,
  STAGE_LABEL_CLASSES,
  STAGE_MARKER_CLASSES,
  STAGE_RAIL_LABEL,
  STAGE_STATE_ICONS,
} from "./StageRail.constants";
import { EDraftStageState } from "./StageRail.enums";
import { IStageRailProps } from "./StageRail.interfaces";

const StageRail = ({ stages }: IStageRailProps) => (
  <ol aria-label={STAGE_RAIL_LABEL} className="grid grid-cols-4">
    {stages.map(({ stage, label, state, meta }, index) => {
      const Icon = STAGE_STATE_ICONS[state];
      const isCurrent = state === EDraftStageState.CURRENT;
      const isLast = index === stages.length - 1;

      return (
        <li
          key={stage}
          aria-current={isCurrent ? "step" : undefined}
          className="flex flex-col gap-1.5"
        >
          <span className="flex items-center">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full",
                STAGE_MARKER_CLASSES[state],
                isCurrent ? CURRENT_STAGE_CLASSES[stage].marker : null,
              )}
            >
              {Icon ? <Icon aria-hidden className="size-2.5" strokeWidth={3.5} /> : null}
              {isCurrent ? (
                <span className={cn("size-1.5 rounded-full", CURRENT_STAGE_CLASSES[stage].dot)} />
              ) : null}
            </span>
            {isLast ? null : (
              <span
                className={cn(
                  "mx-1 h-0 flex-1 border-t-[0.1rem]",
                  state === EDraftStageState.DONE
                    ? "border-foreground"
                    : "border-dashed border-status-draft-line",
                )}
              />
            )}
          </span>
          <span
            className={cn(
              "text-xs",
              STAGE_LABEL_CLASSES[state],
              isCurrent ? CURRENT_STAGE_CLASSES[stage].label : null,
            )}
          >
            {label}
          </span>
          {meta ? (
            <span className="font-mono text-[0.6875rem] leading-3.5 text-muted-foreground">
              {meta}
            </span>
          ) : null}
        </li>
      );
    })}
  </ol>
);

export default StageRail;
