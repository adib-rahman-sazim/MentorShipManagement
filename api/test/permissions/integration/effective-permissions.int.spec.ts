import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";

import { Permission } from "@/common/entities/permissions.entity";
import { RolePermission } from "@/common/entities/roles-permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EffectivePermissionsService } from "@/modules/permissions/effective-permissions.service";
import {
  ALL_MANAGE_PERMISSION_CODE,
  DEFAULT_PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSION_CODES,
} from "@/modules/permissions/permissions.catalog.constants";
import {
  EPermissionCode,
  EPermissionOverrideEffect,
} from "@/modules/permissions/permissions.enums";
import type { PermissionsRepository } from "@/modules/permissions/permissions.repository";
import type { RolePermissionsRepository } from "@/modules/permissions/role-permissions.repository";
import type { UserPermissionOverridesRepository } from "@/modules/permissions/user-permission-overrides.repository";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import { seedPermissionCatalogInDb } from "../../utils/helpers/permissions.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const SUBJECT_EMAIL = "resolver-subject@int.test";
const SUPERADMIN_EMAIL = "resolver-superadmin@int.test";
const USER_READ_CODE = EPermissionCode.CAN_READ_USER;
const USER_UPDATE_CODE = EPermissionCode.CAN_UPDATE_USER;
const USER_DELETE_CODE = EPermissionCode.CAN_DELETE_USER;
const OVERRIDE_REASON = "Covering for the team lead during leave";

describe("EffectivePermissionsService (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let subject: User;
  let superadmin: User;

  const buildService = (): EffectivePermissionsService =>
    new EffectivePermissionsService(
      dbService.getRepository(Permission) as PermissionsRepository,
      dbService.getRepository(RolePermission) as RolePermissionsRepository,
      dbService.getRepository(UserPermissionOverride) as UserPermissionOverridesRepository,
    );

  const resolveCodes = async (user: User, role: EUserRole): Promise<string[]> => {
    const permissions = await buildService().resolveForUser({ userId: user.id, role });

    return permissions.map((permission) => permission.code);
  };

  const createOverride = async (
    user: User,
    code: string,
    effect: EPermissionOverrideEffect,
  ): Promise<UserPermissionOverride> => {
    const permission = await dbService.findOneOrFail(Permission, { code });
    const override = dbService.create(UserPermissionOverride, {
      user,
      permission,
      effect,
      grantedBy: superadmin,
      reason: OVERRIDE_REASON,
    });

    dbService.persist(override);
    await dbService.flush();

    return override;
  };

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();

    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
    await seedPermissionCatalogInDb(dbService);

    subject = await createUserInDb(dbService, { email: SUBJECT_EMAIL, role: EUserRole.MENTEE });
    superadmin = await createUserInDb(dbService, {
      email: SUPERADMIN_EMAIL,
      role: EUserRole.SUPERADMIN,
    });
  });

  it("resolves the permissions seeded for the user's role", async () => {
    const codes = await resolveCodes(subject, EUserRole.MENTEE);

    expect(codes).toEqual([...DEFAULT_ROLE_PERMISSION_CODES[EUserRole.MENTEE]].sort());
  });

  it("adds a permission granted to the user individually", async () => {
    await createOverride(subject, USER_UPDATE_CODE, EPermissionOverrideEffect.ALLOW);

    const codes = await resolveCodes(subject, EUserRole.MENTEE);

    expect(codes).toContain(USER_UPDATE_CODE);
  });

  it("removes a permission revoked from the user individually", async () => {
    await createOverride(subject, USER_READ_CODE, EPermissionOverrideEffect.REVOKE);

    const codes = await resolveCodes(subject, EUserRole.MENTEE);

    expect(codes).not.toContain(USER_READ_CODE);
  });

  it("ignores a soft-deleted override", async () => {
    const override = await createOverride(
      subject,
      USER_READ_CODE,
      EPermissionOverrideEffect.REVOKE,
    );

    override.deletedAt = dayjs().toDate();
    await dbService.flush();

    const codes = await resolveCodes(subject, EUserRole.MENTEE);

    expect(codes).toContain(USER_READ_CODE);
  });

  it("expands manage-everything for a superadmin and honours a revoke against it", async () => {
    await createOverride(superadmin, USER_DELETE_CODE, EPermissionOverrideEffect.REVOKE);

    const codes = await resolveCodes(superadmin, EUserRole.SUPERADMIN);
    const expectedCodes = DEFAULT_PERMISSION_DEFINITIONS.map((definition) => definition.code)
      .filter((code) => code !== ALL_MANAGE_PERMISSION_CODE && code !== USER_DELETE_CODE)
      .sort();

    expect(codes).toEqual(expectedCodes);
    expect(codes).not.toContain(ALL_MANAGE_PERMISSION_CODE);
  });
});
