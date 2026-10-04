import { ReactNode } from "react";

import { ForcedSubject, MongoAbility } from "@casl/ability";

import { EPermission, EResource } from "@/shared/typedefs";

export type TAppResource = Exclude<EResource, EResource.ALL>;

export type TSubjectConditions = Record<string, unknown>;

export type TAppSubjectInstance = ForcedSubject<TAppResource> & TSubjectConditions;

export type TAppAbility = MongoAbility<[EPermission, EResource | TAppSubjectInstance]>;

export type TCanCheck = (action: EPermission, resource: TAppResource) => boolean;

export type TAbilityContextType = {
  ability: TAppAbility;
  holdsAllManage: boolean;
  isAbilityLoading: boolean;
  isAbilityError: boolean;
};

export type TAbilityProviderProps = {
  children: ReactNode;
};

export type TReachabilityRule = Partial<
  Pick<ReturnType<TAppAbility["rulesFor"]>[number], "inverted" | "conditions">
>;
