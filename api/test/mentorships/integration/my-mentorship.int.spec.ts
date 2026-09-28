import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import type { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const SENSEI_EMAIL = "my-sensei@int.test";
const MENTOR_A_EMAIL = "my-mentor-a@int.test";
const MENTOR_B_EMAIL = "my-mentor-b@int.test";
const MENTEE_A1_EMAIL = "my-mentee-a1@int.test";
const MENTEE_B1_EMAIL = "my-mentee-b1@int.test";

describe("My mentorship queries (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let mentorB: User;
  let menteeA1: User;
  let menteeB1: User;

  let senseiToMentorA: Mentorship;
  let senseiToMentorB: Mentorship;
  let mentorAToMenteeA1: Mentorship;

  const repository = (): MentorshipsRepository =>
    dbService.getRepository(Mentorship) as MentorshipsRepository;

  const chainIdsOf = async (user: User) =>
    (await repository().findChain(user.id, MENTORSHIP_SUBTREE_MAX_DEPTH)).map(
      ({ mentorship }) => mentorship.id,
    );

  const teamIdsOf = async (user: User) =>
    (await repository().findTeam(user.id, MENTORSHIP_SUBTREE_MAX_DEPTH))
      .map((mentorship) => mentorship.id)
      .sort();

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

    sensei = await createUserInDb(dbService, { email: SENSEI_EMAIL, role: EUserRole.SENSEI });
    const mentorA = await createUserInDb(dbService, {
      email: MENTOR_A_EMAIL,
      role: EUserRole.MENTOR,
    });
    mentorB = await createUserInDb(dbService, { email: MENTOR_B_EMAIL, role: EUserRole.MENTOR });
    menteeA1 = await createUserInDb(dbService, { email: MENTEE_A1_EMAIL, role: EUserRole.MENTEE });
    menteeB1 = await createUserInDb(dbService, { email: MENTEE_B1_EMAIL, role: EUserRole.MENTEE });

    senseiToMentorA = await link(sensei, mentorA, EMentorshipRelationshipType.SENSEI_MENTOR);
    senseiToMentorB = await link(sensei, mentorB, EMentorshipRelationshipType.SENSEI_MENTOR);
    mentorAToMenteeA1 = await link(mentorA, menteeA1);
    await link(mentorB, menteeB1);
  });

  describe("findChain", () => {
    it("ignores an ended relationship", async () => {
      await dbService.nativeUpdate(
        Mentorship,
        { id: senseiToMentorA.id },
        { status: EMentorshipStatus.ENDED, endedAt: dayjs().toDate() },
      );

      await expect(chainIdsOf(menteeA1)).resolves.toEqual([mentorAToMenteeA1.id]);
    });

    it("terminates on cyclic data instead of hanging", async () => {
      const closingEdge = await link(menteeB1, sensei, EMentorshipRelationshipType.SENSEI_MENTOR);
      const mentorBToMenteeB1 = await repository().findOneOrFail({ subordinate: menteeB1 });

      await expect(chainIdsOf(sensei)).resolves.toEqual([closingEdge.id, mentorBToMenteeB1.id]);
    });
  });

  describe("findTeam", () => {
    it("ignores a soft-deleted relationship and everything under it", async () => {
      await dbService.nativeUpdate(
        Mentorship,
        { id: senseiToMentorB.id },
        { deletedAt: dayjs().toDate() },
      );

      await expect(teamIdsOf(sensei)).resolves.toEqual(
        [senseiToMentorA.id, mentorAToMenteeA1.id].sort(),
      );
    });

    it("terminates on cyclic data and leaves out the edge that closes the loop", async () => {
      const closingEdge = await link(menteeB1, sensei, EMentorshipRelationshipType.SENSEI_MENTOR);

      const teamIds = await teamIdsOf(sensei);

      expect(teamIds).toHaveLength(4);
      expect(teamIds).not.toContain(closingEdge.id);
    });
  });
});
