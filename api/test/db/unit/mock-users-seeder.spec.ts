import type { EntityManager } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { Account } from "@/common/entities/accounts.entity";
import { Member } from "@/common/entities/members.entity";
import { Organization } from "@/common/entities/organizations.entity";
import { Role } from "@/common/entities/roles.entity";
import { UserRole } from "@/common/entities/user-roles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { DEFAULT_ORGANIZATION_SLUG } from "@/db/seeders/core-seeders/Seed20260723000003_default_organization/default-organization.constants";
import { MOCK_USERS } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/mock-users.constants";
import { Seed20260723000005_MockUsers } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/Seed20260723000005_mock_users";
import { OrganizationFactory } from "@/test/utils/factories/organizations.factory";
import { RoleFactory } from "@/test/utils/factories/roles.factory";
import { UserFactory } from "@/test/utils/factories/users.factory";

vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed-password"),
}));

describe("Seed20260723000005_MockUsers", () => {
  let orm: MikroORM;
  let organizationFactory: OrganizationFactory;
  let roleFactory: RoleFactory;
  let userFactory: UserFactory;

  beforeAll(() => {
    orm = MikroORM.initSync({
      clientUrl: "postgresql://localhost:5432/unused",
      connect: false,
      allowGlobalContext: true,
      entities: [User, Account, Organization, Member, Role, UserRole],
    });
    organizationFactory = new OrganizationFactory(orm.em);
    roleFactory = new RoleFactory(orm.em);
    userFactory = new UserFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  afterEach(() => {
    orm.em.clear();
    vi.restoreAllMocks();
  });

  it("ensures roles and membership for existing mock users without recreating them", async () => {
    const organization = organizationFactory.makeEntity({
      id: "org-1",
      slug: DEFAULT_ORGANIZATION_SLUG,
    });
    const managerUser = userFactory.makeEntity({
      id: "manager-1",
      email: MOCK_USERS[0].email,
      firstName: "Mock",
      lastName: "Manager",
      name: "Mock Manager",
    });
    const customerUser = userFactory.makeEntity({
      id: "customer-1",
      email: MOCK_USERS[1].email,
      firstName: "Mock",
      lastName: "Customer",
      name: "Mock Customer",
    });
    const managerAccount = orm.em.create(Account, {
      id: "account-manager",
      user: managerUser,
      accountId: MOCK_USERS[0].email,
      providerId: "credential",
      password: "existing-hash",
    });
    const customerAccount = orm.em.create(Account, {
      id: "account-customer",
      user: customerUser,
      accountId: MOCK_USERS[1].email,
      providerId: "credential",
      password: "existing-hash",
    });
    const managerRole = roleFactory.makeEntity({
      id: 2,
      slug: EUserRole.MANAGER,
      name: "Manager",
      isSystem: true,
    });
    const customerRole = roleFactory.makeEntity({
      id: 3,
      slug: EUserRole.CUSTOMER,
      name: "Customer",
      isSystem: false,
    });

    const usersByEmail = new Map<string, User>([
      [MOCK_USERS[0].email, managerUser],
      [MOCK_USERS[1].email, customerUser],
    ]);
    const accountsByUserId = new Map<string, Account>([
      [managerUser.id, managerAccount],
      [customerUser.id, customerAccount],
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
      if (entity === Member || entity === UserRole) {
        return null as never;
      }
      return null as never;
    });
    em.findOneOrFail.mockImplementation(async (entity, where) => {
      if (entity === Organization) {
        return organization as never;
      }
      if (entity === Role) {
        const slug = (where as { slug?: EUserRole }).slug;
        if (slug === EUserRole.MANAGER) {
          return managerRole as never;
        }
        if (slug === EUserRole.CUSTOMER) {
          return customerRole as never;
        }
      }
      throw new Error("unexpected findOneOrFail");
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
    expect(createdEntities.filter((entity) => entity instanceof UserRole)).toHaveLength(2);
    expect(createdEntities.filter((entity) => entity instanceof Member)).toHaveLength(1);
    expect(managerAccount.password).toBe("existing-hash");
    expect(customerAccount.password).toBe("existing-hash");
  });
});
