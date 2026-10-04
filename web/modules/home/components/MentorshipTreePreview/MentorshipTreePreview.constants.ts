import type { IPreviewPerson } from "@/modules/home/home.interfaces";
import { EUserRole } from "@/shared/typedefs";

export const PREVIEW_TREE: IPreviewPerson = {
  name: "Farzana Haque",
  role: EUserRole.SENSEI,
  reports: [
    {
      name: "Tanvir Ahmed",
      role: EUserRole.MENTOR,
      reports: [
        { name: "Rafid Karim", role: EUserRole.MENTEE, reports: [] },
        { name: "Nabila Islam", role: EUserRole.MENTEE, reports: [] },
      ],
    },
    {
      name: "Shamima Rahman",
      role: EUserRole.MENTOR,
      reports: [{ name: "Mehnaz Sultana", role: EUserRole.MENTEE, isProposed: true, reports: [] }],
    },
  ],
};

export const PREVIEW_TIER_ROLES: readonly EUserRole[] = [
  EUserRole.SENSEI,
  EUserRole.MENTOR,
  EUserRole.MENTEE,
];

export const PREVIEW_ARIA_LABEL =
  "Example mentorship hierarchy: a Sensei leads two Mentors, each with their own Mentees. One new Mentee is proposed in a draft.";
export const LIVE_LEGEND_LABEL = "Live mentorship";
export const PROPOSED_LEGEND_LABEL = "Proposed in a draft";
