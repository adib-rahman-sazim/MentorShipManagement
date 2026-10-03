import type { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import type { EUserRole } from "@/common/enums/roles.enums";

export interface IAbilityContext {
  userId: string;
  role: EUserRole;
}

export interface ISubjectWithFields {
  __caslSubjectType__?: string;
  id?: string;
  userId?: string;
  createdBy?: string;
  relationshipType?: EMentorshipRelationshipType;
}
