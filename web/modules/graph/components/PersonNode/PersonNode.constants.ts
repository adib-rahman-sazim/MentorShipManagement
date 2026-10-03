import { EUserRole } from "@/shared/typedefs";

export const SUBORDINATE_NOUN: Partial<Record<EUserRole, string>> = {
  [EUserRole.SENSEI]: "mentor",
  [EUserRole.MENTOR]: "mentee",
};

export const NO_MENTOR_LABEL = "no mentor";
export const META_SEPARATOR = " · ";
export const DRAFT_HANDLE_CLASS = "graph-handle";
