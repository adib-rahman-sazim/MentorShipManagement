import type { EUserRole } from "@/common/enums/roles.enums";

export interface IAbilityContext {
  userId: string;
  role?: EUserRole;
  roles?: EUserRole[];
  activeOrganizationId?: string;
}

export interface ISubjectWithFields {
  __caslSubjectType__?: string;
  id?: string;
  userId?: string;
  organizationId?: string | null;
}
