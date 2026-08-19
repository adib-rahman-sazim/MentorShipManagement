import { createContext, useContext, useMemo } from "react";

import { createMongoAbility } from "@casl/ability";
import { createContextualCan } from "@casl/react";

import { useGetMyPermissionsQuery } from "@/shared/redux/rtk-apis/permissions/permissions.api";

import { useAuth } from "../AuthProvider";
import { getIsAbilityLoading } from "./AbilityProvider.helpers";
import { TAbilityContextType, TAbilityProviderProps, TAppAbility } from "./AbilityProvider.types";

const defaultAbility = createMongoAbility<TAppAbility>([]);

const AbilityContext = createContext<TAbilityContextType>({
  ability: defaultAbility,
  isAbilityLoading: true,
  isAbilityError: false,
});

export const PureAbilityContext = createContext(defaultAbility);

export const Can = createContextualCan(PureAbilityContext.Consumer);

export function AbilityProvider({ children }: TAbilityProviderProps) {
  const { isAuthenticated, user, activeOrganizationId } = useAuth();

  const permissionsContextKey = useMemo(() => {
    if (!isAuthenticated || !user?.id) {
      return "anonymous";
    }

    return `${user.id}:${activeOrganizationId ?? "none"}`;
  }, [isAuthenticated, user?.id, activeOrganizationId]);

  const { data, isLoading, isFetching, isUninitialized, isError } = useGetMyPermissionsQuery(
    permissionsContextKey,
    {
      refetchOnMountOrArgChange: true,
      skip: !isAuthenticated,
    },
  );

  const ability = useMemo(() => createMongoAbility<TAppAbility>(data?.rules ?? []), [data?.rules]);
  const hasRulesData = data?.rules !== undefined;
  const isAbilityLoading = getIsAbilityLoading({
    isAuthenticated,
    hasRulesData,
    isLoading,
    isFetching,
    isUninitialized,
  });

  const value = useMemo<TAbilityContextType>(
    () => ({
      ability,
      isAbilityLoading,
      isAbilityError: isError,
    }),
    [ability, isAbilityLoading, isError],
  );

  return (
    <AbilityContext.Provider value={value}>
      <PureAbilityContext.Provider value={ability}>{children}</PureAbilityContext.Provider>
    </AbilityContext.Provider>
  );
}

export function useAbilityContext(): TAbilityContextType {
  return useContext(AbilityContext);
}
