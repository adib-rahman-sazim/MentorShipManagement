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
import { Seed20260723000004_OrganizationOwner } from "@/db/seeders/core-seeders/Seed20260723000004_organization_owner/Seed20260723000004_organization_owner";
import { OrganizationFactory } from "@/test/utils/factories/organizations.factory";
import { RoleFactory } from "@/test/utils/factories/roles.factory";
import { UserFactory } from "@/test/utils/factories/users.factory";

vi.mock("better-auth/crypto", () => ({
  hashPassword: vi.fn(async () => "hashed-password"),
}));

describe("Seed20260723000004_OrganizationOwner", () => {
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
    delete process.env.ORGANIZATION_OWNER_EMAIL;
    delete process.env.ORGANIZATION_OWNER_PASSWORD;
  });

  it("ensures member and user role for an existing owner without recreating account password", async () => {
    process.env.ORGANIZATION_OWNER_EMAIL = "owner@sazim.io";

    const organization = organizationFactory.makeEntity({
      id: "org-1",
      slug: DEFAULT_ORGANIZATION_SLUG,
      name: "Default Organization",
      createdBy: null,
    });
    const user = userFactory.makeEntity({
      id: "user-1",
      email: "owner@sazim.io",
      firstName: "Old",
      lastName: "Name",
      name: "Old Name",
    });
    const existingAccount = orm.em.create(Account, {
      id: "account-1",
      user,
      accountId: "owner@sazim.io",
      providerId: "credential",
      password: "existing-hash",
    });
    const superAdminRole = roleFactory.makeEntity({
      id: 1,
      slug: EUserRole.SUPER_ADMIN,
      name: "Super Admin",
      isSystem: true,
    });

    const createdEntities: unknown[] = [];
    const em = mockDeep<EntityManager>();
    em.findOne.mockImplementation(async (entity, where) => {
      if (entity === Organization) {
        return organization as never;
      }
      if (entity === User) {
        return ((where as { email?: string }).email === "owner@sazim.io" ? user : null) as never;
      }
      if (entity === Account) {
        return existingAccount as never;
      }
      if (entity === Member || entity === UserRole) {
        return null as never;
      }
      return null as never;
    });
    em.findOneOrFail.mockImplementation(async (entity) => {
      if (entity === Organization) {
        return organization as never;
      }
      if (entity === Role) {
        return superAdminRole as never;
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

    await new Seed20260723000004_OrganizationOwner().run(em);

    expect(organization.createdBy).toBe(user);
    expect(createdEntities.some((entity) => entity instanceof Member)).toBe(true);
    expect(createdEntities.some((entity) => entity instanceof UserRole)).toBe(true);
    expect(em.create).not.toHaveBeenCalledWith(
      Account,
      expect.objectContaining({ password: "hashed-password" }),
    );
    expect(existingAccount.password).toBe("existing-hash");
  });
});
