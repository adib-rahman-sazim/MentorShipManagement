import { MikroORM } from "@mikro-orm/postgresql";

import { Account } from "@/common/entities/accounts.entity";
import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { Session } from "@/common/entities/sessions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { User } from "@/common/entities/users.entity";

import { OFFLINE_ORM_CLIENT_URL } from "./offline-orm.constants";

export const createOfflineOrm = (): MikroORM =>
  MikroORM.initSync({
    clientUrl: OFFLINE_ORM_CLIENT_URL,
    connect: false,
    allowGlobalContext: true,
    entities: [User, Account, Role, Session, Permission, RolePermission, UserPermissionOverride],
  });
