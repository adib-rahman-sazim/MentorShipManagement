import type { IPolicyScope } from "./contextual-policies.interfaces";
import type { TPolicyConditions } from "./contextual-policies.types";

export function unconditionalConditions(): TPolicyConditions {
  return undefined;
}

export function isAnySubjectAllowed(): boolean {
  return true;
}

export function selfConditions({ actorId }: IPolicyScope): TPolicyConditions {
  return { id: actorId };
}

export function isSelfSubject({ actorId }: IPolicyScope, subjectId: string): boolean {
  return subjectId === actorId;
}

export function subtreeConditions({ subtreeUserIds }: IPolicyScope): TPolicyConditions {
  return { id: { $in: subtreeUserIds } };
}

export function isSubtreeSubject({ subtreeUserIds }: IPolicyScope, subjectId: string): boolean {
  return subtreeUserIds.includes(subjectId);
}

export function hierarchyConditions({
  subtreeUserIds,
  chainUserIds,
}: IPolicyScope): TPolicyConditions {
  return { id: { $in: [...subtreeUserIds, ...chainUserIds] } };
}

export function isHierarchySubject(
  { subtreeUserIds, chainUserIds }: IPolicyScope,
  subjectId: string,
): boolean {
  return subtreeUserIds.includes(subjectId) || chainUserIds.includes(subjectId);
}

export function notAuthorConditions({ actorId }: IPolicyScope): TPolicyConditions {
  return { createdBy: { $ne: actorId } };
}

export function isNotAuthorSubject({ actorId }: IPolicyScope, authorId: string): boolean {
  return authorId !== actorId;
}
