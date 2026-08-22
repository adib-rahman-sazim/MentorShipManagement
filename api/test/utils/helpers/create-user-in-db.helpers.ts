import type { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

import { hashPassword } from "better-auth/crypto";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { MOCK_USER_EMAIL, MOCK_USER_PASSWORD } from "./create-user-in-db.constants";

export const createUserInDb = async (
  dbService: EntityManager<IDatabaseDriver<Connection>>,
  config?: {
    email?: string;
    password?: string;
    name?: string;
    role?: EUserRole;
    state?: EUserState;
    emailVerified?: boolean;
  },
  shouldFlush = true,
) => {
  const defaultConfig = {
    email: MOCK_USER_EMAIL,
    password: MOCK_USER_PASSWORD,
    name: "Test User",
    role: EUserRole.MENTEE,
    state: EUserState.ACTIVE,
    emailVerified: true,
  };

  const values = {
    ...defaultConfig,
    ...config,
  };

  const hashedPassword = await hashPassword(values.password);

  let role = await dbService.findOne(Role, { code: values.role });
  if (!role) {
    role = dbService.create(Role, { code: values.role, name: values.role });
    dbService.persist(role);
    await dbService.flush();
  }

  const user = dbService.create(User, {
    email: values.email,
    name: values.name,
    role,
    state: values.state,
    emailVerified: values.emailVerified,
  });

  dbService.persist(user);
  await dbService.flush();

  const account = dbService.create(Account, {
    user,
    accountId: user.id,
    providerId: "credential",
    password: hashedPassword,
  });

  dbService.persist(account);

  if (shouldFlush) {
    await dbService.flush();
  }

  return user;
};
