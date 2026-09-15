import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import request from "supertest";

import type { User } from "@/common/entities/users.entity";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { ensureRoleInDb } from "../utils/helpers/roles.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  E2E_PASSWORD,
  ME_ROUTE,
  MENTEE_EMAIL,
  MENTOR_EMAIL,
  PROVISIONED_EMAIL,
  PROVISIONED_NAME,
  PROVISIONED_PASSWORD,
  SENSEI_EMAIL,
  SIGN_IN_ROUTE,
  SUPERADMIN_EMAIL,
  UNKNOWN_USER_ID,
  USERS_ROUTE,
  VICTIM_EMAIL,
} from "./users.e2e-spec.constants";

const userRoute = (userId: string) => `${USERS_ROUTE}/${userId}`;

describe("Users (E2E)", () => {
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

  const signIn = async (email: string, password = E2E_PASSWORD): Promise<string> => {
    const response = await request(httpServer)
      .post(SIGN_IN_ROUTE)
      .send({ email, password })
      .expect(HttpStatus.OK);

    return response.body.token;
  };

  const arrangeSuperadmin = async (): Promise<string> => {
    await createUserInDb(dbService, {
      email: SUPERADMIN_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SUPERADMIN,
    });

    return signIn(SUPERADMIN_EMAIL);
  };

  const arrangeMentee = async (email = MENTEE_EMAIL): Promise<User> =>
    createUserInDb(dbService, {
      email,
      password: E2E_PASSWORD,
      role: EUserRole.MENTEE,
    });

  const arrangeSensei = async (): Promise<string> => {
    await createUserInDb(dbService, {
      email: SENSEI_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SENSEI,
    });

    return signIn(SENSEI_EMAIL);
  };

  const arrangeMentor = async (): Promise<string> => {
    await createUserInDb(dbService, {
      email: MENTOR_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTOR,
    });

    return signIn(MENTOR_EMAIL);
  };

  const provisionPayload = (overrides: Record<string, unknown> = {}) => ({
    email: PROVISIONED_EMAIL,
    name: PROVISIONED_NAME,
    password: PROVISIONED_PASSWORD,
    role: EUserRole.MENTOR,
    ...overrides,
  });

  describe("POST /users", () => {
    it("provisions an account the new user can actually sign in with", async () => {
      const token = await arrangeSuperadmin();
      await ensureRoleInDb(dbService, EUserRole.MENTOR);

      const createResponse = await request(httpServer)
        .post(USERS_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .send(provisionPayload())
        .expect(HttpStatus.CREATED);

      expect(createResponse.body.data).toMatchObject({
        email: PROVISIONED_EMAIL,
        name: PROVISIONED_NAME,
        role: EUserRole.MENTOR,
        state: EUserState.ACTIVE,
      });
      expect(createResponse.body.data).not.toHaveProperty("password");

      const provisionedToken = await signIn(PROVISIONED_EMAIL, PROVISIONED_PASSWORD);

      const meResponse = await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${provisionedToken}`)
        .expect(HttpStatus.OK);

      expect(meResponse.body.data).toMatchObject({
        email: PROVISIONED_EMAIL,
        role: EUserRole.MENTOR,
      });
    });

    it("rejects a duplicate email with a conflict", async () => {
      const token = await arrangeSuperadmin();
      await ensureRoleInDb(dbService, EUserRole.MENTOR);
      await arrangeMentee(PROVISIONED_EMAIL);

      await request(httpServer)
        .post(USERS_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .send(provisionPayload())
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe("GET /users/:id", () => {
    it("returns the user with a flattened role code", async () => {
      const token = await arrangeSuperadmin();
      const mentee = await arrangeMentee();

      const response = await request(httpServer)
        .get(userRoute(mentee.id))
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toMatchObject({
        id: mentee.id,
        email: MENTEE_EMAIL,
        role: EUserRole.MENTEE,
      });
      expect(typeof response.body.data.role).toBe("string");
    });

    it("404s for an id that does not exist", async () => {
      const token = await arrangeSuperadmin();

      await request(httpServer)
        .get(userRoute(UNKNOWN_USER_ID))
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("DELETE /users/:id", () => {
    it("soft-deletes the user, hides them from reads and revokes their session", async () => {
      const token = await arrangeSuperadmin();
      const victim = await arrangeMentee(VICTIM_EMAIL);
      const victimToken = await signIn(VICTIM_EMAIL);

      const deleteResponse = await request(httpServer)
        .delete(userRoute(victim.id))
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(deleteResponse.body).toEqual({});

      const listResponse = await request(httpServer)
        .get(USERS_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(
        listResponse.body.data.data.map((user: { email: string }) => user.email),
      ).not.toContain(VICTIM_EMAIL);

      await request(httpServer)
        .get(userRoute(victim.id))
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${victimToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("PATCH /users/:id", () => {
    it("propagates a role change to the target user's own view", async () => {
      const token = await arrangeSuperadmin();
      const mentee = await arrangeMentee();
      const menteeToken = await signIn(MENTEE_EMAIL);
      await ensureRoleInDb(dbService, EUserRole.MENTOR);

      await request(httpServer)
        .patch(userRoute(mentee.id))
        .set("Authorization", `Bearer ${token}`)
        .send({ role: EUserRole.MENTOR })
        .expect(HttpStatus.OK);

      const meResponse = await request(httpServer)
        .get(ME_ROUTE)
        .set("Authorization", `Bearer ${menteeToken}`)
        .expect(HttpStatus.OK);

      expect(meResponse.body.data.role).toBe(EUserRole.MENTOR);
    });
  });

  describe("permission gating", () => {
    it("lets a superadmin list users", async () => {
      const token = await arrangeSuperadmin();

      await request(httpServer)
        .get(USERS_ROUTE)
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);
    });

    it("lets a sensei list users", async () => {
      const senseiToken = await arrangeSensei();

      await request(httpServer)
        .get(USERS_ROUTE)
        .set("Authorization", `Bearer ${senseiToken}`)
        .expect(HttpStatus.OK);
    });

    it("lets a sensei read a user", async () => {
      const senseiToken = await arrangeSensei();
      const mentee = await arrangeMentee();

      await request(httpServer)
        .get(userRoute(mentee.id))
        .set("Authorization", `Bearer ${senseiToken}`)
        .expect(HttpStatus.OK);
    });

    it("forbids a sensei from provisioning a user", async () => {
      const senseiToken = await arrangeSensei();
      await ensureRoleInDb(dbService, EUserRole.MENTOR);

      await request(httpServer)
        .post(USERS_ROUTE)
        .set("Authorization", `Bearer ${senseiToken}`)
        .send(provisionPayload())
        .expect(HttpStatus.FORBIDDEN);
    });

    it("forbids a sensei from updating another user", async () => {
      const senseiToken = await arrangeSensei();
      const mentee = await arrangeMentee();

      await request(httpServer)
        .patch(userRoute(mentee.id))
        .set("Authorization", `Bearer ${senseiToken}`)
        .send({ name: "Renamed" })
        .expect(HttpStatus.FORBIDDEN);
    });

    it("forbids a mentor from listing users", async () => {
      const mentorToken = await arrangeMentor();

      await request(httpServer)
        .get(USERS_ROUTE)
        .set("Authorization", `Bearer ${mentorToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("forbids a mentor from reading a user", async () => {
      const mentorToken = await arrangeMentor();
      const mentee = await arrangeMentee();

      await request(httpServer)
        .get(userRoute(mentee.id))
        .set("Authorization", `Bearer ${mentorToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("lets a mentee read a user", async () => {
      const mentee = await arrangeMentee();
      const menteeToken = await signIn(MENTEE_EMAIL);
      const target = await arrangeMentee(VICTIM_EMAIL);

      expect(mentee.id).not.toBe(target.id);

      await request(httpServer)
        .get(userRoute(target.id))
        .set("Authorization", `Bearer ${menteeToken}`)
        .expect(HttpStatus.OK);
    });

    it("forbids a mentee from provisioning a user", async () => {
      await arrangeMentee();
      const menteeToken = await signIn(MENTEE_EMAIL);

      await request(httpServer)
        .post(USERS_ROUTE)
        .set("Authorization", `Bearer ${menteeToken}`)
        .send(provisionPayload())
        .expect(HttpStatus.FORBIDDEN);
    });

    it("forbids a mentee from deleting a user", async () => {
      await arrangeMentee();
      const menteeToken = await signIn(MENTEE_EMAIL);
      const victim = await arrangeMentee(VICTIM_EMAIL);

      await request(httpServer)
        .delete(userRoute(victim.id))
        .set("Authorization", `Bearer ${menteeToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
