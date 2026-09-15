import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { UniqueConstraintViolationException } from "@mikro-orm/core";

import dayjs from "dayjs";

import type { Permission } from "@/common/entities/permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EPermission, EPermissionOverrideEffect } from "@/modules/permissions/permissions.enums";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { PermissionFactory } from "../../utils/factories/permissions.factory";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";
import {
  GRANTED_BY_EMAIL,
  OTHER_PERMISSION_CODE,
  OTHER_SUBJECT_EMAIL,
  OVERRIDE_REASON,
  PERMISSION_CODE,
  SUBJECT_EMAIL,
} from "./user-permission-overrides.int.spec.constants";

describe("user_permission_overrides (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let subject: User;
  let otherSubject: User;
  let grantedBy: User;
  let permission: Permission;
  let otherPermission: Permission;

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

    subject = await createUserInDb(dbService, {
      email: SUBJECT_EMAIL,
      role: EUserRole.MENTEE,
    });
    otherSubject = await createUserInDb(dbService, {
      email: OTHER_SUBJECT_EMAIL,
      role: EUserRole.MENTEE,
    });
    grantedBy = await createUserInDb(dbService, {
      email: GRANTED_BY_EMAIL,
      role: EUserRole.SUPERADMIN,
    });

    permission = new PermissionFactory(dbService).makeEntity({
      code: PERMISSION_CODE,
      action: EPermission.UPDATE,
    });
    otherPermission = new PermissionFactory(dbService).makeEntity({
      code: OTHER_PERMISSION_CODE,
      action: EPermission.DELETE,
    });

    dbService.persist([permission, otherPermission]);
    await dbService.flush();
  });

  const buildOverride = (
    overrideUser: User,
    overridePermission: Permission,
    effect: EPermissionOverrideEffect,
  ): UserPermissionOverride => {
    const override = dbService.create(UserPermissionOverride, {
      user: overrideUser,
      permission: overridePermission,
      effect,
      grantedBy,
      reason: OVERRIDE_REASON,
    });

    dbService.persist(override);

    return override;
  };

  it("stores a live override for a user and permission", async () => {
    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    await dbService.flush();

    const subjectId = subject.id;
    const permissionId = permission.id;
    const grantedById = grantedBy.id;
    dbService.clear();

    const stored = await dbService.findOneOrFail(UserPermissionOverride, {
      user: subjectId,
      permission: permissionId,
    });

    expect(stored.effect).toBe(EPermissionOverrideEffect.ALLOW);
    expect(stored.grantedBy.id).toBe(grantedById);
    expect(stored.reason).toBe(OVERRIDE_REASON);
    expect(stored.deletedAt).toBeNull();
  });

  it("rejects a second live override for the same user and permission", async () => {
    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    await dbService.flush();

    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);

    await expect(dbService.flush()).rejects.toThrow(UniqueConstraintViolationException);
  });

  it("rejects a revoke alongside a live allow for the same user and permission", async () => {
    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    await dbService.flush();

    buildOverride(subject, permission, EPermissionOverrideEffect.REVOKE);

    await expect(dbService.flush()).rejects.toThrow(UniqueConstraintViolationException);
  });

  it("allows a new override for a pair whose previous override was soft-deleted", async () => {
    const original = buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    await dbService.flush();

    original.deletedAt = dayjs().toDate();
    await dbService.flush();

    buildOverride(subject, permission, EPermissionOverrideEffect.REVOKE);

    await expect(dbService.flush()).resolves.toBeUndefined();

    const live = await dbService.find(UserPermissionOverride, {
      user: subject,
      permission,
      deletedAt: null,
    });

    expect(live).toHaveLength(1);
    expect(live[0]?.effect).toBe(EPermissionOverrideEffect.REVOKE);
  });

  it("allows the same permission to be overridden for different users", async () => {
    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    buildOverride(otherSubject, permission, EPermissionOverrideEffect.REVOKE);

    await expect(dbService.flush()).resolves.toBeUndefined();
  });

  it("allows different permissions to be overridden for the same user", async () => {
    buildOverride(subject, permission, EPermissionOverrideEffect.ALLOW);
    buildOverride(subject, otherPermission, EPermissionOverrideEffect.REVOKE);

    await expect(dbService.flush()).resolves.toBeUndefined();
  });
});
