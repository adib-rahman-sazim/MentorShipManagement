import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  HEALTH_ROUTE,
  ME_ROUTE,
  SENSEI_EMAIL,
  SENSEI_PASSWORD,
  SIGN_IN_ROUTE,
  SIGN_OUT_ROUTE,
  SIGN_UP_ROUTE,
} from "./auth.e2e-spec.constants";

describe("Auth (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

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
  });

  const signIn = (email = SENSEI_EMAIL, password = SENSEI_PASSWORD) =>
    request(httpServer).post(SIGN_IN_ROUTE).send({ email, password });

  describe("the MMS-15 session lifecycle", () => {
    it("signs in, authorises a request, signs out, then rejects the reused token", async () => {
      await createUserInDb(dbService, {
        email: SENSEI_EMAIL,
        password: SENSEI_PASSWORD,
        role: EUserRole.SENSEI,
      });

      // 1. sign in -> session token
      const signInResponse = await signIn().expect(HttpStatus.OK);
      const token = signInResponse.body.token;

      expect(token).toEqual(expect.any(String));

      // 2. the token authorises a protected request
      const meResponse = await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(meResponse.body.data).toMatchObject({
        email: SENSEI_EMAIL,
        role: EUserRole.SENSEI,
        state: EUserState.ACTIVE,
      });

      // 3. sign out
      await request(httpServer)
        .post(SIGN_OUT_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      // 4. the same token is now rejected
      await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("guard behaviour", () => {
    it("rejects an unauthenticated request to a protected route", async () => {
      await request(httpServer).get(ME_ROUTE).expect(HttpStatus.UNAUTHORIZED);
    });

    it("rejects a garbage bearer token", async () => {
      await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", "Bearer not-a-real-token")
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("allows a @Public() route without any credentials", async () => {
      await request(httpServer).get(HEALTH_ROUTE).expect(HttpStatus.OK);
    });

    it("forbids an INACTIVE user from signing in", async () => {
      await createUserInDb(dbService, {
        email: SENSEI_EMAIL,
        password: SENSEI_PASSWORD,
        role: EUserRole.SENSEI,
        state: EUserState.INACTIVE,
      });

      await signIn().expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("sign-up", () => {
    it("is not reachable", async () => {
      await request(httpServer)
        .post(SIGN_UP_ROUTE)
        .send({ email: "intruder@e2e.test", password: SENSEI_PASSWORD, name: "Intruder" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("role propagation", () => {
    it.each([
      EUserRole.SUPERADMIN,
      EUserRole.SENSEI,
      EUserRole.MENTOR,
      EUserRole.MENTEE,
    ])("carries %s through to the session so ABAC can read it", async (role) => {
      await createUserInDb(dbService, {
        email: SENSEI_EMAIL,
        password: SENSEI_PASSWORD,
        role,
      });

      const { body } = await signIn().expect(HttpStatus.OK);

      const meResponse = await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${body.token}`)
        .expect(HttpStatus.OK);

      expect(meResponse.body.data.role).toBe(role);
    });
  });
});
