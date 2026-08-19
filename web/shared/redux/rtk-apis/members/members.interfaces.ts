import { EUserRole } from "../roles/roles.enums";

export interface IUpdateMemberRoleDto {
  userId: string;
  roleSlugs: EUserRole[];
}

export interface IUpdateSystemRolesDto {
  userId: string;
  roleSlugs: EUserRole[];
}
