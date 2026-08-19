import type { EntityManager } from "@mikro-orm/core";

import { hashPassword } from "better-auth/crypto";

import { Account } from "@/common/entities/accounts.entity";
import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { Role } from "@/common/entities/roles.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { User } from "@/common/entities/users.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
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

export async function ensureUserRole(
  em: EntityManager,
  user: User,
  roleSlug: EUserRole,
  organization: Organization | null,
): Promise<void> {
  const role = await em.findOneOrFail(Role, { slug: roleSlug });
  const existing = await em.findOne(UserRole, {
    user,
    role,
    organization,
  });

  if (!existing) {
    em.create(UserRole, {
      user,
      role,
      organization,
    });
  }
}

export async function ensureMember(
  em: EntityManager,
  user: User,
  organization: Organization,
  role: EUserRole,
): Promise<void> {
  const existing = await em.findOne(Member, {
    user,
    organization,
  });

  if (!existing) {
    em.create(Member, {
      user,
      organization,
      role,
    });
    return;
  }

  if (existing.role !== role) {
    existing.role = role;
    em.persist(existing);
  }
}
