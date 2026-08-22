import { Account } from "./accounts.entity";
import { CustomBaseEntity } from "./custom-base.entity";
import { Permission } from "./permissions.entity";
import { Role } from "./roles.entity";
import { RolePermission } from "./roles-permissions.entity";
import { Session } from "./sessions.entity";
import { User } from "./users.entity";
import { Verification } from "./verifications.entity";

export const ENTITIES = [
  CustomBaseEntity,
  Account,
  Permission,
  Role,
  RolePermission,
  Session,
  User,
  Verification,
];
