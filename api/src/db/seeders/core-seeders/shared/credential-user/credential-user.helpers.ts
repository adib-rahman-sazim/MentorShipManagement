import type { EntityManager } from "@mikro-orm/core";

import { hashPassword } from "better-auth/crypto";

import { Account } from "@/common/entities/accounts.entity";
import { User } from "@/common/entities/users.entity";
import { EUserState } from "@/common/enums/users.enums";

import { CREDENTIAL_PROVIDER_ID } from "./credential-user.constants";
import type { TEnsureCredentialUserParams } from "./credential-user.types";

export async function ensureCredentialUser(
  em: EntityManager,
  params: TEnsureCredentialUserParams,
): Promise<User> {
  let user = await em.findOne(User, { email: params.email });
  const isNewUser = !user;

  if (!user) {
    user = em.create(User, {
      email: params.email,
      emailVerified: true,
      firstName: params.firstName,
      lastName: params.lastName,
      name: params.name,
      state: EUserState.ACTIVE,
    });
    em.persist(user);
  } else {
    user.firstName = params.firstName;
    user.lastName = params.lastName;
    user.name = params.name;
    user.emailVerified = true;
    user.state = EUserState.ACTIVE;
    em.persist(user);
  }

  if (!isNewUser) {
    const existingAccount = await em.findOne(Account, {
      user,
      providerId: CREDENTIAL_PROVIDER_ID,
    });
    if (existingAccount) {
      return user;
    }
  }

  const hashedPassword = await hashPassword(params.password);
  em.create(Account, {
    user,
    accountId: params.email,
    providerId: CREDENTIAL_PROVIDER_ID,
    password: hashedPassword,
  });

  await em.flush();

  return user;
}
