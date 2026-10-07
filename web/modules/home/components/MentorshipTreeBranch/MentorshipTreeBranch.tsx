import { cn } from "@/lib/utils";
import MentorshipTreeNode from "@/modules/home/components/MentorshipTreeNode";
import {
  TREE_BRANCH_DELAY_CLASSES,
  TREE_LINK_HEIGHT_CLASS,
  TREE_PROPOSED_LINK_DELAY_CLASS,
  TREE_STEM_DELAY_CLASSES,
} from "@/modules/home/home.constants";

import { LIVE_LINK_CLASS, PROPOSED_LINK_CLASS } from "./MentorshipTreeBranch.constants";
import {
  getSiblingLinkClass,
  getSubtreeGrowClass,
  hasSiblingStem,
} from "./MentorshipTreeBranch.helpers";
import type { IMentorshipTreeBranchProps } from "./MentorshipTreeBranch.interfaces";

const MentorshipTreeBranch = ({ person, depth }: IMentorshipTreeBranchProps) => (
  <div className="flex w-full flex-col items-center">
    <MentorshipTreeNode person={person} depth={depth} />
    {person.reports.length > 0 ? (
      <>
        <span
          aria-hidden
          className={cn(
            "w-0 origin-top border-l-[0.09375rem] motion-safe:animate-home-grow-y",
            LIVE_LINK_CLASS,
            TREE_LINK_HEIGHT_CLASS,
            TREE_STEM_DELAY_CLASSES[depth],
          )}
        />
        <ul className="flex w-full">
          {person.reports.map((report, index) => {
            const siblingCount = person.reports.length;
            const linkClassName = report.isProposed
              ? cn(PROPOSED_LINK_CLASS, TREE_PROPOSED_LINK_DELAY_CLASS)
              : cn(LIVE_LINK_CLASS, TREE_BRANCH_DELAY_CLASSES[depth]);

            return (
              <li
                key={report.name}
                className={cn("flex min-w-0 basis-0 flex-col", getSubtreeGrowClass(report))}
              >
                <span aria-hidden className={cn("relative", TREE_LINK_HEIGHT_CLASS)}>
                  <span
                    className={cn(
                      "absolute inset-y-0 motion-safe:animate-home-grow-x",
                      getSiblingLinkClass(index, siblingCount),
                      linkClassName,
                    )}
                  />
                  {hasSiblingStem(index, siblingCount) ? (
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 w-0 origin-top border-l-[0.09375rem] motion-safe:animate-home-grow-y",
                        linkClassName,
                      )}
                    />
                  ) : null}
                </span>
                <MentorshipTreeBranch person={report} depth={depth + 1} />
              </li>
            );
          })}
        </ul>
      </>
    ) : null}
  </div>
);

export default MentorshipTreeBranch;
