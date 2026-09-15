import type { EntityManager } from "@mikro-orm/postgresql";

import { Account } from "@/common/entities/accounts.entity";
import type { User } from "@/common/entities/users.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";
import { CREDENTIAL_PROVIDER_ID } from "@/modules/auth/auth.constants";

export class AccountsRepository extends CustomSQLBaseRepository<Account> {
  findCredentialAccount(user: User, em?: EntityManager): Promise<Account | null> {
    return this.getScopedRepository(em).findOne({ user, providerId: CREDENTIAL_PROVIDER_ID });
  }

  createCredentialAccount(user: User, hashedPassword: string, em?: EntityManager): Account {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const account = scopedEntityManager.create(Account, {
      user,
      accountId: user.id,
      providerId: CREDENTIAL_PROVIDER_ID,
      password: hashedPassword,
    });
    scopedEntityManager.persist(account);

    return account;
  }
}
