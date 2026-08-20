import type { EntityManager } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { Account } from "@/common/entities/accounts.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";
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
    const mentorUser = userFactory.makeEntity({
      id: "mentor-1",
      email: MOCK_USERS[0].email,
      firstName: "Mock",
      lastName: "Mentor",
      name: "Mock Mentor",
    });
    const menteeUser = userFactory.makeEntity({
      id: "mentee-1",
      email: MOCK_USERS[1].email,
      firstName: "Mock",
      lastName: "Mentee",
      name: "Mock Mentee",
    });
    const mentorAccount = orm.em.create(Account, {
      id: "account-mentor",
      user: mentorUser,
      accountId: MOCK_USERS[0].email,
      providerId: "credential",
      password: "existing-hash",
    });
    const menteeAccount = orm.em.create(Account, {
      id: "account-mentee",
      user: menteeUser,
      accountId: MOCK_USERS[1].email,
      providerId: "credential",
      password: "existing-hash",
    });

    const usersByEmail = new Map<string, User>([
      [MOCK_USERS[0].email, mentorUser],
      [MOCK_USERS[1].email, menteeUser],
    ]);
    const accountsByUserId = new Map<string, Account>([
      [mentorUser.id, mentorAccount],
      [menteeUser.id, menteeAccount],
    ]);
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
    expect(mentorAccount.password).toBe("existing-hash");
    expect(menteeAccount.password).toBe("existing-hash");
  });
});
