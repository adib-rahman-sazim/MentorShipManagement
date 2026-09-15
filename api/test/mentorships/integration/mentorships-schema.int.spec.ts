import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType, EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const SUPERVISOR_EMAIL = "schema-supervisor@int.test";
const OTHER_SUPERVISOR_EMAIL = "schema-other-supervisor@int.test";
const SUBORDINATE_EMAIL = "schema-subordinate@int.test";

describe("Mentorship schema (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let supervisor: User;
  let otherSupervisor: User;
  let subordinate: User;

  const buildMentorship = (overrides: Partial<Mentorship> = {}): Mentorship =>
    dbService.create(Mentorship, {
      supervisor,
      subordinate,
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
      ...overrides,
    });

  const persist = async (mentorship: Mentorship): Promise<void> => {
    dbService.persist(mentorship);
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

    supervisor = await createUserInDb(dbService, {
      email: SUPERVISOR_EMAIL,
      role: EUserRole.MENTOR,
    });
    otherSupervisor = await createUserInDb(dbService, {
      email: OTHER_SUPERVISOR_EMAIL,
      role: EUserRole.MENTOR,
    });
    subordinate = await createUserInDb(dbService, {
      email: SUBORDINATE_EMAIL,
      role: EUserRole.MENTEE,
    });
  });

  describe("one active mentorship per subordinate", () => {
    it("rejects a second active mentorship for the same subordinate", async () => {
      await persist(buildMentorship());
      dbService.clear();

      const duplicate = dbService.create(Mentorship, {
        supervisor: otherSupervisor,
        subordinate,
        relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
        status: EMentorshipStatus.ACTIVE,
        startedAt: dayjs().toDate(),
      });
      dbService.persist(duplicate);

      await expect(dbService.flush()).rejects.toThrow(
        /mentorships_active_subordinate_unique|unique/i,
      );

      dbService.clear();
    });

    it("allows many ended mentorships for the same subordinate", async () => {
      await persist(buildMentorship({ status: EMentorshipStatus.ACTIVE }));
      await persist(
        buildMentorship({ status: EMentorshipStatus.ENDED, endedAt: dayjs().toDate() }),
      );
      await persist(
        buildMentorship({ status: EMentorshipStatus.ENDED, endedAt: dayjs().toDate() }),
      );

      const counts = await dbService.count(Mentorship, { subordinate });

      expect(counts).toBe(3);
    });

    it("allows a new active mentorship once the previous one is soft-deleted", async () => {
      const original = buildMentorship();
      await persist(original);

      original.deletedAt = dayjs().toDate();
      await dbService.flush();

      await persist(buildMentorship({ supervisor: otherSupervisor }));

      const live = await dbService.count(Mentorship, {
        subordinate,
        status: EMentorshipStatus.ACTIVE,
        deletedAt: null,
      });

      expect(live).toBe(1);
    });
  });

  describe("card scope", () => {
    it("does not create mentorship_draft_items — that belongs to MMS-37", async () => {
      const rows: Array<{ table_name: string }> = await dbService
        .getConnection()
        .execute(
          "select table_name from information_schema.tables where table_schema = 'public' and table_name like 'mentorship%' order by table_name;",
        );

      expect(rows.map((row) => row.table_name)).toEqual(["mentorship_drafts", "mentorships"]);
    });
  });
});
