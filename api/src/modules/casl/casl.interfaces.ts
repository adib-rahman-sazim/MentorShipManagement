import type { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import type { EUserRole } from "@/common/enums/roles.enums";

import type { TAppAbility, TAppRawRule } from "./casl.types";

export interface IAbilityContext {
  userId: string;
  role: EUserRole;
}

export interface ICachedUserAbility {
  rules: TAppRawRule[];
  holdsAllManage: boolean;
}

export interface IUserAbility {
  ability: TAppAbility;
  holdsAllManage: boolean;
}

export interface ISubjectWithFields {
  __caslSubjectType__?: string;
  id?: string;
  userId?: string;
  createdBy?: string;
  relationshipType?: EMentorshipRelationshipType;
}
