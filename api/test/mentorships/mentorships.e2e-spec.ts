import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";
import request from "supertest";

import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  E2E_PASSWORD,
  MENTEE_EMAIL,
  MENTOR_EMAIL,
  MY_MENTORSHIP_ROUTE,
  SENSEI_EMAIL,
  SUPERADMIN_EMAIL,
} from "./mentorships.e2e-spec.constants";

describe("Mentorships (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let mentor: User;
  let mentee: User;

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

  const arrangeUser = (email: string, role: EUserRole): Promise<User> =>
    createUserInDb(dbService, { email, name: email, role, password: E2E_PASSWORD });

  const arrangeMentorship = async (
    supervisor: User,
    subordinate: User,
    relationshipType: EMentorshipRelationshipType,
  ): Promise<void> => {
    dbService.create(Mentorship, {
      supervisor,
      subordinate,
      relationshipType,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
    });

    await dbService.flush();
  };

  const getMyMentorshipAs = async (email: string) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .get(MY_MENTORSHIP_ROUTE)
      .set("Authorization", `Bearer ${token}`)
      .expect(HttpStatus.OK);
  };

  const person = (user: User, role: EUserRole) => ({ id: user.id, name: user.name, role });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();

    await arrangeUser(SUPERADMIN_EMAIL, EUserRole.SUPERADMIN);
    sensei = await arrangeUser(SENSEI_EMAIL, EUserRole.SENSEI);
    mentor = await arrangeUser(MENTOR_EMAIL, EUserRole.MENTOR);
    mentee = await arrangeUser(MENTEE_EMAIL, EUserRole.MENTEE);

    await arrangeMentorship(sensei, mentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    await arrangeMentorship(mentor, mentee, EMentorshipRelationshipType.MENTOR_MENTEE);
  });

  describe("GET /mentorships/me", () => {
    it("fails with UNAUTHORIZED(401) without a session", async () => {
      await request(httpServer).get(MY_MENTORSHIP_ROUTE).expect(HttpStatus.UNAUTHORIZED);
    });

    it("returns OK(200) with a mentee's supervisors nearest first", async () => {
      const response = await getMyMentorshipAs(MENTEE_EMAIL);

      expect(response.body.data).toEqual({
        supervisors: [
          expect.objectContaining({ depth: 1, supervisor: person(mentor, EUserRole.MENTOR) }),
          expect.objectContaining({ depth: 2, supervisor: person(sensei, EUserRole.SENSEI) }),
        ],
        team: [],
      });
    });

    it("returns OK(200) with a sensei's mentors and each mentor's mentees nested", async () => {
      const response = await getMyMentorshipAs(SENSEI_EMAIL);

      expect(response.body.data).toEqual({
        supervisors: [],
        team: [
          expect.objectContaining({
            user: person(mentor, EUserRole.MENTOR),
            team: [expect.objectContaining({ user: person(mentee, EUserRole.MENTEE), team: [] })],
          }),
        ],
      });
    });

    it("returns OK(200) with both lists empty for a superadmin", async () => {
      const response = await getMyMentorshipAs(SUPERADMIN_EMAIL);

      expect(response.body.data).toEqual({ supervisors: [], team: [] });
    });
  });
});
