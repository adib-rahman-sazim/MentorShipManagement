import type { IPreviewPerson } from "@/modules/home/home.interfaces";

import {
  FIRST_SIBLING_LINK_CLASS,
  LAST_SIBLING_LINK_CLASS,
  MIDDLE_SIBLING_LINK_CLASS,
  ONLY_SIBLING_LINK_CLASS,
  SUBTREE_GROW_CLASSES,
} from "./MentorshipTreeBranch.constants";

export function getSiblingLinkClass(index: number, siblingCount: number): string {
  if (siblingCount === 1) {
    return ONLY_SIBLING_LINK_CLASS;
  }

  if (index === 0) {
    return FIRST_SIBLING_LINK_CLASS;
  }

  return index === siblingCount - 1 ? LAST_SIBLING_LINK_CLASS : MIDDLE_SIBLING_LINK_CLASS;
}

export function hasSiblingStem(index: number, siblingCount: number): boolean {
  return siblingCount === 1 || (index > 0 && index < siblingCount - 1);
}

export function getLeafCount(person: IPreviewPerson): number {
  if (person.reports.length === 0) {
    return 1;
  }

  return person.reports.reduce((total, report) => total + getLeafCount(report), 0);
}

export function getSubtreeGrowClass(person: IPreviewPerson): string {
  const index = Math.min(getLeafCount(person), SUBTREE_GROW_CLASSES.length) - 1;

  return SUBTREE_GROW_CLASSES[index] ?? "";
}
