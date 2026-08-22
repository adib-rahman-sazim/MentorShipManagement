import type { EntityManager } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";
import type { EUserRole } from "@/common/enums/roles.enums";
import { MOCK_USERS } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/mock-users.constants";
import { Seed20260723000005_MockUsers } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/Seed20260723000005_mock_users";
import { UserFactory } from "@/test/utils/factories/users.factory";

vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed-password"),
}));

describe("Seed20260723000005_MockUsers", () => {
  let orm: MikroORM;
  let userFactory: UserFactory;

  beforeAll(() => {
    orm = MikroORM.initSync({
      clientUrl: "postgresql://localhost:5432/unused",
      connect: false,
      allowGlobalContext: true,
      entities: [User, Account, Role],
    });
    userFactory = new UserFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  afterEach(() => {
    orm.em.clear();
    vi.restoreAllMocks();
  });

  it("does not recreate existing mock users or their credential accounts", async () => {
    const existingUsers = MOCK_USERS.map((fixture, index) =>
      userFactory.makeEntity({
        id: `user-${index}`,
        email: fixture.email,
        name: fixture.name,
      }),
    );

    const existingAccounts = existingUsers.map((user, index) =>
      orm.em.create(Account, {
        id: `account-${index}`,
        user,
        accountId: MOCK_USERS[index].email,
        providerId: "credential",
        password: "existing-hash",
      }),
    );

    const usersByEmail = new Map<string, User>(
      existingUsers.map((user) => [user.email, user] as const),
    );
    const accountsByUserId = new Map<string, Account>(
      existingAccounts.map((account, index) => [existingUsers[index].id, account] as const),
    );
    const createdEntities: unknown[] = [];

    const em = mockDeep<EntityManager>();
    em.findOne.mockImplementation(async (entity, where) => {
      if (entity === User) {
        const email = (where as { email?: string }).email;
        return (email ? (usersByEmail.get(email) ?? null) : null) as never;
      }
      if (entity === Account) {
        const user = (where as { user?: User }).user;
        return (user ? (accountsByUserId.get(user.id) ?? null) : null) as never;
      }
      return null as never;
    });
    em.findOneOrFail.mockImplementation(async (entity, where) => {
      if (entity === Role) {
        const { code } = where as { code: EUserRole };
        return orm.em.create(Role, { code, name: code }) as never;
      }
      return null as never;
    });
    em.create.mockImplementation((entityName, data) => {
      const created = orm.em.create(entityName, data);
      createdEntities.push(created);
      return created;
    });
    em.persist.mockReturnValue(em);
    em.flush.mockResolvedValue(undefined);

    await new Seed20260723000005_MockUsers().run(em);

    expect(createdEntities.filter((entity) => entity instanceof User)).toHaveLength(0);
    expect(createdEntities.filter((entity) => entity instanceof Account)).toHaveLength(0);
    for (const account of existingAccounts) {
      expect(account.password).toBe("existing-hash");
    }
  });
});
