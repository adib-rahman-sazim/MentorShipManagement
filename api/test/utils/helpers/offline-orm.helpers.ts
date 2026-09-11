import { MikroORM } from "@mikro-orm/postgresql";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { Session } from "@/common/entities/sessions.entity";
import { User } from "@/common/entities/users.entity";

import { OFFLINE_ORM_CLIENT_URL } from "./offline-orm.constants";


export const createOfflineOrm = (): MikroORM =>
  MikroORM.initSync({
    clientUrl: OFFLINE_ORM_CLIENT_URL,
    connect: false,
    allowGlobalContext: true,
    entities: [User, Account, Role, Session],
  });
