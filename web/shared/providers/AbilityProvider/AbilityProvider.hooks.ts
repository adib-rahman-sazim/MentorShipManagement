import { useAbility as useCaslAbility } from "@casl/react";

import { EPermission, EResource } from "@/shared/typedefs";

import { PureAbilityContext, useAbilityContext } from "./AbilityProvider";
import type { TReachabilityRule } from "./AbilityProvider.types";

export const useCan = (
  action: EPermission,
  resource: EResource | "all",
  conditions?: Record<string, unknown>,
) => {
  const { isAbilityLoading, isAbilityError } = useAbilityContext();
  const ability = useCaslAbility(PureAbilityContext);

  const isAllowed =
    conditions && resource !== "all"
      ? ability.can(action, { __caslSubjectType__: resource, ...conditions } as never)
      : ability.can(action, resource);

  return { isAllowed, isLoading: isAbilityLoading, isError: isAbilityError };
};

const ruleHasReachableConditions = (conditions: unknown): boolean => {
  if (!conditions || typeof conditions !== "object" || Array.isArray(conditions)) {
    return true;
  }

  for (const value of Object.values(conditions)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      const inClause = nested["$in"];
      if (Array.isArray(inClause) && inClause.length === 0) {
        return false;
      }
    }
  }
  return true;
};

export const isAllowedForAnyResourceRules = (rules: TReachabilityRule[]): boolean => {
  const hasReachableAllowedRule = rules.some(
    (rule) => !rule.inverted && ruleHasReachableConditions(rule.conditions),
  );
  const hasReachableDeniedRule = rules.some(
    (rule) => !!rule.inverted && ruleHasReachableConditions(rule.conditions),
  );

  return hasReachableAllowedRule && !hasReachableDeniedRule;
};

export const useCanForAnyResource = (action: EPermission, resource: EResource | "all") => {
  const { isAbilityLoading, isAbilityError } = useAbilityContext();
  const ability = useCaslAbility(PureAbilityContext);

  const rules = ability.rulesFor(action, resource);
  const isAllowed = isAllowedForAnyResourceRules(rules);

  return { isAllowed, isLoading: isAbilityLoading, isError: isAbilityError };
};
