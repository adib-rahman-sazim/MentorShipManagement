import type { EntityManager } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { Role } from "@/common/entities/roles.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { Seed20260723000001_Roles } from "@/db/seeders/core-seeders/Seed20260723000001_roles/Seed20260723000001_roles";
import { RoleFactory } from "@/test/utils/factories/roles.factory";

describe("Seed20260723000001_Roles", () => {
  let orm: MikroORM;
  let roleFactory: RoleFactory;

  beforeAll(() => {
    orm = MikroORM.initSync({
      clientUrl: "postgresql://localhost:5432/unused",
      connect: false,
      allowGlobalContext: true,
      entities: [Role],
    });
    roleFactory = new RoleFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  afterEach(() => {
    orm.em.clear();
    vi.restoreAllMocks();
  });

  it("creates missing roles", async () => {
    const em = mockDeep<EntityManager>();
    em.findOne.mockResolvedValue(null);
    em.create.mockImplementation((entityName, data) => orm.em.create(entityName, data));

    await new Seed20260723000001_Roles().run(em);

    expect(em.create).toHaveBeenCalledWith(
      Role,
      expect.objectContaining({
        code: EUserRole.SUPERADMIN,
        name: "Superadmin",
      }),
    );
    expect(em.create).toHaveBeenCalledWith(
      Role,
      expect.objectContaining({
        code: EUserRole.SENSEI,
        name: "Sensei",
      }),
    );
    expect(em.create).toHaveBeenCalledWith(
      Role,
      expect.objectContaining({
        code: EUserRole.MENTEE,
        name: "Mentee",
      }),
    );
    expect(em.flush).toHaveBeenCalled();
  });

  it("updates existing role fields without creating duplicates", async () => {
    const existing = roleFactory.makeEntity({
      id: "00000000-0000-0000-0000-000000000001",
      code: EUserRole.SUPERADMIN,
      name: "Stale Name",
    });

    const em = mockDeep<EntityManager>();
    em.findOne.mockImplementation(async (_entity, where) => {
      if ((where as { code?: EUserRole }).code === EUserRole.SUPERADMIN) {
        return existing as never;
      }
      return null as never;
    });
    em.create.mockImplementation((entityName, data) => orm.em.create(entityName, data));

    await new Seed20260723000001_Roles().run(em);

    expect(existing.name).toBe("Superadmin");
    expect(em.create).not.toHaveBeenCalledWith(
      Role,
      expect.objectContaining({ code: EUserRole.SUPERADMIN }),
    );
  });
});
