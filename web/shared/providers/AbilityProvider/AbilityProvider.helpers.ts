import { subject } from "@casl/ability";

import { EPermission } from "@/shared/typedefs";

import type { IGetIsAbilityLoadingParams } from "./AbilityProvider.interfaces";
import type { TAppAbility, TAppResource, TSubjectConditions } from "./AbilityProvider.types";

export const getIsAbilityLoading = ({
  isAuthenticated,
  hasRulesData,
  isLoading,
  isFetching,
  isUninitialized,
}: IGetIsAbilityLoadingParams): boolean => {
  if (!isAuthenticated) {
    return false;
  }
  if (hasRulesData) {
    return false;
  }

  return isLoading || isFetching || isUninitialized;
};

export function canPerform(
  ability: TAppAbility,
  action: EPermission,
  resource: TAppResource,
  conditions?: TSubjectConditions,
): boolean {
  return conditions
    ? ability.can(action, subject(resource, { ...conditions }))
    : ability.can(action, resource);
}
