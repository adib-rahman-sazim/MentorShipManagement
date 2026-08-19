import { ReactNode } from "react";

import { MongoAbility } from "@casl/ability";

import { EPermission, EResource } from "@/shared/typedefs";

export type TAppAbility = MongoAbility<[EPermission, EResource | "all"]>;

export type TAbilityContextType = {
  ability: TAppAbility;
  isAbilityLoading: boolean;
  isAbilityError: boolean;
};

export type TAbilityProviderProps = {
  children: ReactNode;
};

export type TReachabilityRule = Partial<
  Pick<ReturnType<TAppAbility["rulesFor"]>[number], "inverted" | "conditions">
>;
