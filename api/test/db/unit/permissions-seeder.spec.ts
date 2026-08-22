import type { EntityManager } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/postgresql";

import { mockDeep } from "vitest-mock-extended";

import { Permission } from "@/common/entities/permissions.entity";
import { Role } from "@/common/entities/roles.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { Seed20260723000002_Permissions } from "@/db/seeders/core-seeders/Seed20260723000002_permissions/Seed20260723000002_permissions";
import {
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import {
  EPermission,
  EPermissionConditionType,
  EResource,
} from "@/modules/permissions/permissions.enums";
import { PermissionFactory } from "@/test/utils/factories/permissions.factory";
import { RoleFactory } from "@/test/utils/factories/roles.factory";
import { createPermission } from "@/utils/permission-string/permission-string.helpers";

describe("Seed20260723000002_Permissions", () => {
  let orm: MikroORM;
  let permissionFactory: PermissionFactory;
  let roleFactory: RoleFactory;

  beforeAll(() => {
    orm = MikroORM.initSync({
      clientUrl: "postgresql://localhost:5432/unused",
      connect: false,
      allowGlobalContext: true,
      entities: [Permission, Role, RolePermission],
    });
    permissionFactory = new PermissionFactory(orm.em);
    roleFactory = new RoleFactory(orm.em);
  });

  afterAll(async () => {
    await orm.close();
  });

  afterEach(() => {
    orm.em.clear();
    vi.restoreAllMocks();
  });

  it("updates drifted permission fields and restores missing role permission links", async () => {
    const manageCode = createPermission(EResource.ALL, EPermission.MANAGE);
    const stalePermission = permissionFactory.makeEntity({
      id: 1,
      code: manageCode,
      resource: EResource.USER,
      action: EPermission.READ,
      conditionType: EPermissionConditionType.NONE,
      denied: true,
      description: "stale",
    });
    const superadminRole = roleFactory.makeEntity({
      id: "00000000-0000-0000-0000-000000000010",
      code: EUserRole.SUPERADMIN,
      name: "Superadmin",
    });

    const permissionsByCode = new Map<string, Permission>([[manageCode, stalePermission]]);
    const createdLinks: RolePermission[] = [];

    const em = mockDeep<EntityManager>();
    em.findOne.mockImplementation(async (entity, where) => {
      if (entity === Permission) {
        const code = (where as { code?: string }).code;
        return (code ? (permissionsByCode.get(code) ?? null) : null) as never;
      }
      if (entity === Role) {
        const code = (where as { code?: EUserRole }).code;
        return (code === EUserRole.SUPERADMIN ? superadminRole : null) as never;
      }
      return null as never;
    });
    em.find.mockImplementation(async (entity) => {
      if (entity === RolePermission) {
        return [] as never;
      }
      return [] as never;
    });
    em.create.mockImplementation((entityName, data) => {
      const created = orm.em.create(entityName, data);
      if (entityName === RolePermission) {
        createdLinks.push(created as RolePermission);
      }
      if (entityName === Permission) {
        const permission = created as Permission;
        permissionsByCode.set(permission.code, permission);
      }
      return created;
    });
    em.persist.mockReturnValue(em);
    em.remove.mockReturnValue(em);
    em.flush.mockResolvedValue(undefined);

    await new Seed20260723000002_Permissions().run(em);

    expect(stalePermission.resource).toBe(EResource.ALL);
    expect(stalePermission.action).toBe(EPermission.MANAGE);
    expect(stalePermission.denied).toBe(false);

    const desiredSuperadminCodes = new Set(DEFAULT_ROLE_PERMISSION_CODES[EUserRole.SUPERADMIN]);
    const createdCodes = createdLinks.map((link) => link.permission.code);
    expect(createdCodes.length).toBe(desiredSuperadminCodes.size);
    expect(new Set(createdCodes)).toEqual(desiredSuperadminCodes);
    expect(em.create.mock.calls.filter(([entity]) => entity === Permission).length).toBe(
      DEFAULT_PERMISSION_DEFINITIONS.length - 1,
    );
  });

  it("does not recreate an existing role permission link", async () => {
    const manageCode = createPermission(EResource.ALL, EPermission.MANAGE);
    const managePermission = permissionFactory.makeEntity({
      id: 1,
      code: manageCode,
      resource: EResource.ALL,
      action: EPermission.MANAGE,
      conditionType: EPermissionConditionType.NONE,
      denied: false,
    });
    const superadminRole = roleFactory.makeEntity({
      id: "00000000-0000-0000-0000-000000000010",
      code: EUserRole.SUPERADMIN,
      name: "Superadmin",
    });
    const existingLink = orm.em.create(RolePermission, {
      role: superadminRole,
      permission: managePermission,
    });

    const em = mockDeep<EntityManager>();
    em.findOne.mockImplementation(async (entity, where) => {
      if (entity === Permission) {
        return (
          (where as { code?: string }).code === manageCode ? managePermission : null
        ) as never;
      }
      if (entity === Role) {
        return (
          (where as { code?: EUserRole }).code === EUserRole.SUPERADMIN ? superadminRole : null
        ) as never;
      }
      return null as never;
    });
    em.find.mockImplementation(async (entity) => {
      if (entity === RolePermission) {
        return [existingLink] as never;
      }
      return [] as never;
    });
    em.create.mockImplementation((entityName, data) => orm.em.create(entityName, data));
    em.persist.mockReturnValue(em);
    em.remove.mockReturnValue(em);
    em.flush.mockResolvedValue(undefined);

    await new Seed20260723000002_Permissions().run(em);

    const rolePermissionCreates = em.create.mock.calls.filter(
      ([entity]) => entity === RolePermission,
    );
    expect(
      rolePermissionCreates.every(
        ([, data]) => (data as { permission: Permission }).permission.code !== manageCode,
      ),
    ).toBe(true);
  });
});
