import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import {
  EPermissionCode,
  EPermissionOverrideEffect,
  EPermissionSource,
} from "@/modules/permissions/permissions.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { seedPermissionCatalogInDb } from "../utils/helpers/permissions.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  E2E_PASSWORD,
  MENTOR_EMAIL,
  OVERRIDE_REASON,
  PERMISSIONS_ROUTE,
  SENSEI_EMAIL,
  SIGN_IN_ROUTE,
  SUBJECT_EMAIL,
  SUBJECT_NEW_NAME,
  SUPERADMIN_EMAIL,
  UNKNOWN_USER_ID,
  USERS_ROUTE,
} from "./permission-overrides.e2e-spec.constants";

const overridesRoute = (userId: string) => `${PERMISSIONS_ROUTE}/users/${userId}/overrides`;

describe("Permission overrides (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let superadmin: User;
  let mentor: User;
  let subject: User;

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

    superadmin = await createUserInDb(dbService, {
      email: SUPERADMIN_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SUPERADMIN,
    });
    await createUserInDb(dbService, {
      email: SENSEI_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SENSEI,
    });
    mentor = await createUserInDb(dbService, {
      email: MENTOR_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTOR,
    });
    subject = await createUserInDb(dbService, {
      email: SUBJECT_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTEE,
    });
  });

  const signIn = async (email: string): Promise<string> => {
    const response = await request(httpServer)
      .post(SIGN_IN_ROUTE)
      .send({ email, password: E2E_PASSWORD })
      .expect(HttpStatus.OK);

    return response.body.token;
  };

  const readOverrides = (token: string, userId: string) =>
    request(httpServer).get(overridesRoute(userId)).set("Authorization", `Bearer ${token}`);

  const writeOverrides = (
    token: string,
    userId: string,
    overrides: Array<{ permissionCode: EPermissionCode; effect: EPermissionOverrideEffect }>,
  ) =>
    request(httpServer)
      .put(overridesRoute(userId))
      .set("Authorization", `Bearer ${token}`)
      .send({ overrides, reason: OVERRIDE_REASON });

  const findEntry = (body: { data: { permissions: Array<{ code: string }> } }, code: string) =>
    body.data.permissions.find((permission) => permission.code === code);

  describe(`GET ${PERMISSIONS_ROUTE}/users/:userId/overrides`, () => {
    it("returns OK(200) with every permission and where it came from", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      const response = await readOverrides(token, mentor.id).expect(HttpStatus.OK);

      expect(response.body.data.userId).toBe(mentor.id);
      expect(response.body.data.role).toBe(EUserRole.MENTOR);
      expect(findEntry(response.body, EPermissionCode.CAN_VIEW_DASHBOARD)).toMatchObject({
        source: EPermissionSource.ROLE,
        effective: true,
      });
      expect(findEntry(response.body, EPermissionCode.CAN_UPDATE_USER)).toMatchObject({
        source: EPermissionSource.NONE,
        effective: false,
      });
    });

    it("returns OK(200) reading the superadmin's own record", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      const response = await readOverrides(token, superadmin.id).expect(HttpStatus.OK);

      expect(findEntry(response.body, EPermissionCode.CAN_UPDATE_USER)).toMatchObject({
        source: EPermissionSource.ROLE,
        effective: true,
      });
    });

    it("fails with FORBIDDEN(403) for a non-superadmin", async () => {
      const token = await signIn(SENSEI_EMAIL);

      await readOverrides(token, mentor.id).expect(HttpStatus.FORBIDDEN);
    });

    it("fails with NOT_FOUND(404) for an unknown user", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await readOverrides(token, UNKNOWN_USER_ID).expect(HttpStatus.NOT_FOUND);
    });
  });

  describe(`PUT ${PERMISSIONS_ROUTE}/users/:userId/overrides`, () => {
    it("returns OK(200) granting then revoking a permission, each taking effect on the next read", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      const granted = await writeOverrides(token, mentor.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.ALLOW,
        },
      ]).expect(HttpStatus.OK);

      expect(findEntry(granted.body, EPermissionCode.CAN_UPDATE_USER)).toMatchObject({
        source: EPermissionSource.GRANTED,
        effective: true,
      });

      const afterGrant = await readOverrides(token, mentor.id).expect(HttpStatus.OK);
      expect(findEntry(afterGrant.body, EPermissionCode.CAN_UPDATE_USER)).toMatchObject({
        source: EPermissionSource.GRANTED,
        effective: true,
      });

      const revoked = await writeOverrides(token, mentor.id, [
        {
          permissionCode: EPermissionCode.CAN_VIEW_DASHBOARD,
          effect: EPermissionOverrideEffect.REVOKE,
        },
      ]).expect(HttpStatus.OK);

      expect(findEntry(revoked.body, EPermissionCode.CAN_VIEW_DASHBOARD)).toMatchObject({
        source: EPermissionSource.REVOKED,
        effective: false,
      });
      expect(findEntry(revoked.body, EPermissionCode.CAN_UPDATE_USER)).toMatchObject({
        source: EPermissionSource.NONE,
        effective: false,
      });

      const afterRevoke = await readOverrides(token, mentor.id).expect(HttpStatus.OK);
      expect(findEntry(afterRevoke.body, EPermissionCode.CAN_VIEW_DASHBOARD)).toMatchObject({
        source: EPermissionSource.REVOKED,
        effective: false,
      });
    });

    it("fails with FORBIDDEN(403) when the target is the superadmin", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await writeOverrides(token, superadmin.id, [
        {
          permissionCode: EPermissionCode.CAN_MANAGE_ALL,
          effect: EPermissionOverrideEffect.REVOKE,
        },
      ]).expect(HttpStatus.FORBIDDEN);
    });

    it("fails with FORBIDDEN(403) revoking a non-all:manage code from the superadmin", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await writeOverrides(token, superadmin.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_PERMISSION,
          effect: EPermissionOverrideEffect.REVOKE,
        },
      ]).expect(HttpStatus.FORBIDDEN);
    });

    it("fails with FORBIDDEN(403) granting a permission to the superadmin", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await writeOverrides(token, superadmin.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.ALLOW,
        },
      ]).expect(HttpStatus.FORBIDDEN);
    });

    it("fails with FORBIDDEN(403) for a non-superadmin actor", async () => {
      const token = await signIn(SENSEI_EMAIL);

      await writeOverrides(token, mentor.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.ALLOW,
        },
      ]).expect(HttpStatus.FORBIDDEN);
    });

    it("fails with BAD_REQUEST(400) when a permission code appears twice", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await writeOverrides(token, mentor.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.ALLOW,
        },
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.REVOKE,
        },
      ]).expect(HttpStatus.BAD_REQUEST);
    });

    it("fails with NOT_FOUND(404) for an unknown target user", async () => {
      const token = await signIn(SUPERADMIN_EMAIL);

      await writeOverrides(token, UNKNOWN_USER_ID, []).expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("a permission change takes effect on the target's next request", () => {
    const renameSubject = (token: string) =>
      request(httpServer)
        .patch(`${USERS_ROUTE}/${subject.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: SUBJECT_NEW_NAME });

    it("lets a granted permission through, then shuts it off again once removed", async () => {
      const superadminToken = await signIn(SUPERADMIN_EMAIL);
      const mentorToken = await signIn(MENTOR_EMAIL);

      await renameSubject(mentorToken).expect(HttpStatus.FORBIDDEN);

      await writeOverrides(superadminToken, mentor.id, [
        {
          permissionCode: EPermissionCode.CAN_UPDATE_USER,
          effect: EPermissionOverrideEffect.ALLOW,
        },
      ]).expect(HttpStatus.OK);

      await renameSubject(mentorToken).expect(HttpStatus.OK);

      await writeOverrides(superadminToken, mentor.id, []).expect(HttpStatus.OK);

      await renameSubject(mentorToken).expect(HttpStatus.FORBIDDEN);
    });
  });
});
