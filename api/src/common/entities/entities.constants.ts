import { Account } from "./accounts.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { MentorshipDraft } from "./mentorship-drafts.entity";
import { Mentorship } from "./mentorships.entity";
import { Permission } from "./permissions.entity";
import { Role } from "./roles.entity";
import { RolePermission } from "./roles-permissions.entity";
import { Session } from "./sessions.entity";
import { UserPermissionOverride } from "./user-permission-overrides.entity";
import { User } from "./users.entity";
import { Verification } from "./verifications.entity";

export const ENTITIES = [
  CustomBaseEntity,
  Account,
  Mentorship,
  MentorshipDraft,
  Permission,
  Role,
  RolePermission,
  Session,
  User,
  UserPermissionOverride,
  Verification,
];
