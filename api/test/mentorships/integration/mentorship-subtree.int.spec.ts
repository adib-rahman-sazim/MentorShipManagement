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

const SENSEI_EMAIL = "subtree-sensei@int.test";
const MENTOR_A_EMAIL = "subtree-mentor-a@int.test";
const MENTOR_B_EMAIL = "subtree-mentor-b@int.test";
const MENTEE_A1_EMAIL = "subtree-mentee-a1@int.test";
const MENTEE_A2_EMAIL = "subtree-mentee-a2@int.test";
const MENTEE_B1_EMAIL = "subtree-mentee-b1@int.test";

describe("Mentorship subtree resolution (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let mentorA: User;
  let mentorB: User;
  let menteeA1: User;
  let menteeA2: User;
  let menteeB1: User;

  const repository = (): MentorshipsRepository =>
    dbService.getRepository(Mentorship) as MentorshipsRepository;

  const descendantsOf = (user: User): Promise<string[]> =>
    repository().findDescendantUserIds(user.id, MENTORSHIP_SUBTREE_MAX_DEPTH);

  const ancestorsOf = (user: User): Promise<string[]> =>
    repository().findAncestorUserIds(user.id, MENTORSHIP_SUBTREE_MAX_DEPTH);

  const link = async (
    supervisor: User,
    subordinate: User,
    overrides: Partial<Mentorship> = {},
  ): Promise<Mentorship> => {
    const mentorship = dbService.create(Mentorship, {
      supervisor,
      subordinate,
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
      ...overrides,
    });

    dbService.persist(mentorship);
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
    mentorA = await createUserInDb(dbService, { email: MENTOR_A_EMAIL, role: EUserRole.MENTOR });
    mentorB = await createUserInDb(dbService, { email: MENTOR_B_EMAIL, role: EUserRole.MENTOR });
    menteeA1 = await createUserInDb(dbService, { email: MENTEE_A1_EMAIL, role: EUserRole.MENTEE });
    menteeA2 = await createUserInDb(dbService, { email: MENTEE_A2_EMAIL, role: EUserRole.MENTEE });
    menteeB1 = await createUserInDb(dbService, { email: MENTEE_B1_EMAIL, role: EUserRole.MENTEE });

    await link(sensei, mentorA, {
      relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
    });
    await link(sensei, mentorB, {
      relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
    });
    await link(mentorA, menteeA1);
    await link(mentorA, menteeA2);
    await link(mentorB, menteeB1);
  });

  describe("descendants", () => {
    it("reaches every level below, not just direct reports", async () => {
      const descendants = await descendantsOf(sensei);

      expect(descendants.sort()).toEqual(
        [mentorA.id, mentorB.id, menteeA1.id, menteeA2.id, menteeB1.id].sort(),
      );
    });

    it("returns only the branch belonging to the actor", async () => {
      const descendants = await descendantsOf(mentorA);

      expect(descendants.sort()).toEqual([menteeA1.id, menteeA2.id].sort());
      expect(descendants).not.toContain(menteeB1.id);
    });

    it("is empty for someone at the bottom of the hierarchy", async () => {
      await expect(descendantsOf(menteeA1)).resolves.toEqual([]);
    });

    it("excludes the actor themselves", async () => {
      const descendants = await descendantsOf(sensei);

      expect(descendants).not.toContain(sensei.id);
    });

    it("ignores an ended relationship", async () => {
      const mentorship = await dbService.findOneOrFail(Mentorship, { subordinate: menteeA1 });
      mentorship.status = EMentorshipStatus.ENDED;
      mentorship.endedAt = dayjs().toDate();
      await dbService.flush();

      await expect(descendantsOf(mentorA)).resolves.toEqual([menteeA2.id]);
    });

    it("ignores a soft-deleted relationship", async () => {
      const mentorship = await dbService.findOneOrFail(Mentorship, { subordinate: menteeA1 });
      mentorship.deletedAt = dayjs().toDate();
      await dbService.flush();

      await expect(descendantsOf(mentorA)).resolves.toEqual([menteeA2.id]);
    });

    it("terminates on cyclic data instead of hanging", async () => {
      await link(menteeB1, sensei, {
        relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
      });

      const descendants = await descendantsOf(sensei);

      expect(descendants).not.toContain(sensei.id);
      expect(descendants.sort()).toEqual(
        [mentorA.id, mentorB.id, menteeA1.id, menteeA2.id, menteeB1.id].sort(),
      );
    });

    it("walks the whole tree in a single query", async () => {
      const connection = dbService.getConnection();
      const executeSpy = vi.spyOn(connection, "execute");

      await descendantsOf(sensei);

      expect(executeSpy).toHaveBeenCalledOnce();
      executeSpy.mockRestore();
    });
  });

  describe("ancestors", () => {
    it("returns everyone above the user, at every level", async () => {
      const ancestors = await ancestorsOf(menteeA1);

      expect(ancestors.sort()).toEqual([mentorA.id, sensei.id].sort());
    });

    it("is empty for someone at the top of the hierarchy", async () => {
      await expect(ancestorsOf(sensei)).resolves.toEqual([]);
    });

    it("excludes the user themselves", async () => {
      const ancestors = await ancestorsOf(menteeA1);

      expect(ancestors).not.toContain(menteeA1.id);
    });
  });
});
