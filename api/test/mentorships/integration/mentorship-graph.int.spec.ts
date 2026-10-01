import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { GetMentorshipGraphInteractor } from "@/modules/mentorships/interactors/get-mentorship-graph.interactor";
import type { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { MentorshipsSerializer } from "@/modules/mentorships/mentorships.serializer";
import type { UsersRepository } from "@/modules/users/users.repository";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const SUPERADMIN_EMAIL = "graph-superadmin@int.test";
const SENSEI_EMAIL = "graph-sensei@int.test";
const MENTOR_EMAIL = "graph-mentor@int.test";
const MENTEE_EMAIL = "graph-mentee@int.test";
const EXTRA_MENTEE_COUNT = 5;

describe("Mentorship graph (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let mentor: User;
  let mentee: User;

  const interactor = () =>
    new GetMentorshipGraphInteractor(
      dbService.getRepository(Mentorship) as MentorshipsRepository,
      dbService.getRepository(User) as UsersRepository,
      new MentorshipsSerializer(),
    );

  const link = async (
    supervisor: User,
    subordinate: User,
    relationshipType = EMentorshipRelationshipType.MENTOR_MENTEE,
  ): Promise<Mentorship> => {
    const mentorship = dbService.create(Mentorship, {
      supervisor,
      subordinate,
      relationshipType,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
    });

    await dbService.flush();

    return mentorship;
  };

  const nodeIds = async () => (await interactor().execute()).nodes.map(({ id }) => id).sort();

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

    await createUserInDb(dbService, { email: SUPERADMIN_EMAIL, role: EUserRole.SUPERADMIN });
    sensei = await createUserInDb(dbService, { email: SENSEI_EMAIL, role: EUserRole.SENSEI });
    mentor = await createUserInDb(dbService, { email: MENTOR_EMAIL, role: EUserRole.MENTOR });
    mentee = await createUserInDb(dbService, { email: MENTEE_EMAIL, role: EUserRole.MENTEE });
  });

  it("leaves out ended mentorships", async () => {
    const live = await link(sensei, mentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    const ended = await link(mentor, mentee);
    await dbService.nativeUpdate(
      Mentorship,
      { id: ended.id },
      { status: EMentorshipStatus.ENDED, endedAt: dayjs().toDate() },
    );

    const { edges } = await interactor().execute();

    expect(edges.map(({ id }) => id)).toEqual([live.id]);
  });

  it("keeps a deactivated user on an active edge and drops the superadmin and unlinked deactivated users", async () => {
    await link(mentor, mentee);
    await dbService.nativeUpdate(User, { id: mentor.id }, { state: EUserState.INACTIVE });
    await dbService.nativeUpdate(User, { id: sensei.id }, { state: EUserState.INACTIVE });

    await expect(nodeIds()).resolves.toEqual([mentor.id, mentee.id].sort());
  });

  it("runs the same number of queries whatever the graph size", async () => {
    await link(sensei, mentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    dbService.clear();
    const connection = dbService.getConnection();
    const execute = vi.spyOn(connection, "execute");

    await interactor().execute();
    const smallGraphQueries = execute.mock.calls.length;

    for (let index = 0; index < EXTRA_MENTEE_COUNT; index++) {
      const extraMentee = await createUserInDb(dbService, {
        email: `graph-extra-${index}@int.test`,
        role: EUserRole.MENTEE,
      });
      await link(mentor, extraMentee);
    }
    dbService.clear();
    execute.mockClear();

    await interactor().execute();

    expect(execute.mock.calls.length).toBe(smallGraphQueries);
    execute.mockRestore();
  });
});
