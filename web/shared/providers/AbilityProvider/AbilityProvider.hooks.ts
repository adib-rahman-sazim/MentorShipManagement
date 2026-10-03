import { useAbility as useCaslAbility } from "@casl/react";

import { EPermission } from "@/shared/typedefs";

import { PureAbilityContext, useAbilityContext } from "./AbilityProvider";
import { canPerform } from "./AbilityProvider.helpers";
import type { TAppResource, TReachabilityRule, TSubjectConditions } from "./AbilityProvider.types";

export const useAppAbility = () => useCaslAbility(PureAbilityContext);

export const useCan = (
  action: EPermission,
  resource: TAppResource,
  conditions?: TSubjectConditions,
) => {
  const { isAbilityLoading, isAbilityError } = useAbilityContext();
  const ability = useCaslAbility(PureAbilityContext);

  const isAllowed = canPerform(ability, action, resource, conditions);

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

export const useCanForAnyResource = (action: EPermission, resource: TAppResource) => {
  const { isAbilityLoading, isAbilityError } = useAbilityContext();
  const ability = useCaslAbility(PureAbilityContext);

  const rules = ability.rulesFor(action, resource);
  const isAllowed = isAllowedForAnyResourceRules(rules);

  return { isAllowed, isLoading: isAbilityLoading, isError: isAbilityError };
};
