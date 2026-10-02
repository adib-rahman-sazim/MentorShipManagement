import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";
import request from "supertest";

import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import {
  EPermissionCode,
  EPermissionOverrideEffect,
} from "@/modules/permissions/permissions.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { seedPermissionCatalogInDb } from "../utils/helpers/permissions.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  E2E_PASSWORD,
  GRANT_REASON,
  MENTEE_EMAIL,
  MENTOR_EMAIL,
  OUTSIDER_EMAIL,
  PERMISSIONS_ROUTE,
  RENAMED,
  SENSEI_EMAIL,
  SIGN_IN_ROUTE,
  SUPERADMIN_EMAIL,
  USERS_ROUTE,
} from "./contextual-policies.e2e-spec.constants";

describe("Contextual policies (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let mentor: User;
  let mentee: User;
  let outsider: User;

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

  const link = (
    supervisor: User,
    subordinate: User,
    relationshipType: EMentorshipRelationshipType,
  ) =>
    dbService.create(Mentorship, {
      supervisor,
      subordinate,
      relationshipType,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
    });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
    await seedPermissionCatalogInDb(dbService);

    await createUserInDb(dbService, {
      email: SUPERADMIN_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SUPERADMIN,
    });
    sensei = await createUserInDb(dbService, {
      email: SENSEI_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.SENSEI,
    });
    mentor = await createUserInDb(dbService, {
      email: MENTOR_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTOR,
    });
    mentee = await createUserInDb(dbService, {
      email: MENTEE_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTEE,
    });
    outsider = await createUserInDb(dbService, {
      email: OUTSIDER_EMAIL,
      password: E2E_PASSWORD,
      role: EUserRole.MENTEE,
    });

    link(sensei, mentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    link(mentor, mentee, EMentorshipRelationshipType.MENTOR_MENTEE);
    await dbService.flush();
  });

  const signIn = async (email: string): Promise<string> => {
    const response = await request(httpServer)
      .post(SIGN_IN_ROUTE)
      .send({ email, password: E2E_PASSWORD })
      .expect(HttpStatus.OK);

    return response.body.token;
  };

  const rename = (token: string, userId: string) =>
    request(httpServer)
      .patch(`${USERS_ROUTE}/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: RENAMED });

  const read = (token: string, userId: string) =>
    request(httpServer).get(`${USERS_ROUTE}/${userId}`).set("Authorization", `Bearer ${token}`);

  const grantUpdateUser = (token: string, userId: string) =>
    request(httpServer)
      .put(`${PERMISSIONS_ROUTE}/users/${userId}/overrides`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        overrides: [
          {
            permissionCode: EPermissionCode.CAN_UPDATE_USER,
            effect: EPermissionOverrideEffect.ALLOW,
          },
        ],
        reason: GRANT_REASON,
      });

  describe("writes reach downward only", () => {
    const grantedSenseiToken = async (): Promise<string> => {
      const superadminToken = await signIn(SUPERADMIN_EMAIL);
      await grantUpdateUser(superadminToken, sensei.id).expect(HttpStatus.OK);

      return signIn(SENSEI_EMAIL);
    };

    it("lets a sensei update someone indirectly below them", async () => {
      await rename(await grantedSenseiToken(), mentee.id).expect(HttpStatus.OK);
    });

    it("refuses a sensei for someone outside their hierarchy", async () => {
      await rename(await grantedSenseiToken(), outsider.id).expect(HttpStatus.FORBIDDEN);
    });

    it("refuses a mentor writing upward to their sensei", async () => {
      const superadminToken = await signIn(SUPERADMIN_EMAIL);
      await grantUpdateUser(superadminToken, mentor.id).expect(HttpStatus.OK);

      await rename(await signIn(MENTOR_EMAIL), sensei.id).expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("reads go up as well as down", () => {
    it("lets a mentor read their own mentee", async () => {
      await read(await signIn(MENTOR_EMAIL), mentee.id).expect(HttpStatus.OK);
    });

    it("lets a mentor read their sensei", async () => {
      await read(await signIn(MENTOR_EMAIL), sensei.id).expect(HttpStatus.OK);
    });

    it("refuses a mentor for someone in neither direction", async () => {
      await read(await signIn(MENTOR_EMAIL), outsider.id).expect(HttpStatus.FORBIDDEN);
    });
  });

  describe("the superadmin", () => {
    it("still reaches anyone, hierarchy or not", async () => {
      const superadminToken = await signIn(SUPERADMIN_EMAIL);

      await rename(superadminToken, outsider.id).expect(HttpStatus.OK);
    });

    it("gets unconditional rules from GET /permissions/my", async () => {
      const response = await request(httpServer)
        .get(`${PERMISSIONS_ROUTE}/my`)
        .set("Authorization", `Bearer ${await signIn(SUPERADMIN_EMAIL)}`)
        .expect(HttpStatus.OK);

      const scoped = response.body.data.rules.filter(
        (rule: { conditions?: Record<string, unknown> }) => rule.conditions,
      );

      expect(scoped).toEqual([]);
    });
  });
});
