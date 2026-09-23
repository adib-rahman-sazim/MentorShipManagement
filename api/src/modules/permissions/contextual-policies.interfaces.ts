import type { TPolicyConditions } from "./contextual-policies.types";

export interface IPolicyScope {
  actorId: string;
  subtreeUserIds: string[];
  chainUserIds: string[];
}

export interface IContextualPolicy {
  toConditions: (scope: IPolicyScope) => TPolicyConditions;
  isSatisfiedBy: (scope: IPolicyScope, subjectId: string) => boolean;
}