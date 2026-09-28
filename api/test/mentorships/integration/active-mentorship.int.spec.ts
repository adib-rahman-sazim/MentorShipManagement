import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import type { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const MENTOR_EMAIL = "active-mentor@int.test";
const MENTEE_EMAIL = "active-mentee@int.test";

describe("Active mentorship lookup (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let mentor: User;
  let mentee: User;

  const repository = (): MentorshipsRepository =>
    dbService.getRepository(Mentorship) as MentorshipsRepository;

  const link = async (overrides: Partial<Mentorship> = {}): Promise<void> => {
    dbService.create(Mentorship, {
      supervisor: mentor,
      subordinate: mentee,
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
      ...overrides,
    });

    await dbService.flush();
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

    mentor = await createUserInDb(dbService, { email: MENTOR_EMAIL, role: EUserRole.MENTOR });
    mentee = await createUserInDb(dbService, { email: MENTEE_EMAIL, role: EUserRole.MENTEE });
  });

  it("finds an active mentorship on either side", async () => {
    await link();

    await expect(repository().hasActiveMentorship(mentor.id)).resolves.toBe(true);
    await expect(repository().hasActiveMentorship(mentee.id)).resolves.toBe(true);
  });

  it("ignores ended mentorships", async () => {
    await link({ status: EMentorshipStatus.ENDED, endedAt: dayjs().toDate() });

    await expect(repository().hasActiveMentorship(mentor.id)).resolves.toBe(false);
  });

  it("ignores soft-deleted mentorships", async () => {
    await link({ deletedAt: dayjs().toDate() });

    await expect(repository().hasActiveMentorship(mentor.id)).resolves.toBe(false);
  });
});
