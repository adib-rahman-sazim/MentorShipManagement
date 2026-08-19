import type { IGetIsAbilityLoadingParams } from "./AbilityProvider.interfaces";

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
