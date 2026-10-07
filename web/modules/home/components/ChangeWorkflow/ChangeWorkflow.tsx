import { cn } from "@/lib/utils";
import {
  DRAFT_STAGES,
  STAGE_LABELS,
} from "@/modules/graph/components/StageRail/StageRail.constants";
import { PUBLIC_PAGE_CONTAINER_CLASS } from "@/shared/layouts/GeneralLayout/GeneralLayout.constants";

import {
  WORKFLOW_HEADING,
  WORKFLOW_MARKER_CLASSES,
  WORKFLOW_SECTION_ID,
  WORKFLOW_STAGE_DESCRIPTIONS,
} from "./ChangeWorkflow.constants";

const ChangeWorkflow = () => (
  <section id={WORKFLOW_SECTION_ID} className="scroll-mt-8 border-t">
    <div className={cn(PUBLIC_PAGE_CONTAINER_CLASS, "py-16 md:py-24")}>
      <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance md:text-3xl">
        {WORKFLOW_HEADING}
      </h2>
      <ol className="mt-10 grid gap-8 md:mt-14 lg:grid-cols-4 lg:gap-6">
        {DRAFT_STAGES.map((stage, index) => (
          <li key={stage} className="relative pl-8 lg:pt-8 lg:pl-0">
            <span
              aria-hidden
              className={cn(
                "absolute top-1 left-0 size-3 rounded-full border-[0.125rem] lg:top-0",
                WORKFLOW_MARKER_CLASSES[stage],
              )}
            />
            {index < DRAFT_STAGES.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-5 -bottom-8 left-[0.3125rem] border-l lg:top-[0.3125rem] lg:-right-4 lg:bottom-auto lg:left-5 lg:border-t lg:border-l-0"
              />
            ) : null}
            <h3 className="text-sm font-medium">{STAGE_LABELS[stage]}</h3>
            <p className="mt-1.5 max-w-[38ch] text-sm leading-relaxed text-pretty text-muted-foreground">
              {WORKFLOW_STAGE_DESCRIPTIONS[stage]}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default ChangeWorkflow;
