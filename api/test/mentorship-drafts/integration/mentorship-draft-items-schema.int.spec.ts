import type { INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import type { User } from "@/common/entities/users.entity";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";

import { bootstrapTestServer } from "../../utils/bootstrap";
import { truncateTables } from "../../utils/db";
import { createUserInDb } from "../../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../../utils/http-server.types";

const AUTHOR_EMAIL = "draft-schema-author@int.test";
const MENTOR_EMAIL = "draft-schema-mentor@int.test";
const MENTEE_EMAIL = "draft-schema-mentee@int.test";

describe("Mentorship draft items schema (Integration)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let mentor: User;
  let mentee: User;
  let draft: MentorshipDraft;

  const buildItem = (overrides: Partial<MentorshipDraftItem> = {}): MentorshipDraftItem =>
    dbService.create(MentorshipDraftItem, {
      draft,
      operation: EMentorshipDraftOperation.ASSIGN,
      subordinate: mentee,
      proposedSupervisor: mentor,
      ...overrides,
    });

  const persist = async (...items: MentorshipDraftItem[]): Promise<void> => {
    dbService.persist(items);
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

    const author = await createUserInDb(dbService, { email: AUTHOR_EMAIL, role: EUserRole.SENSEI });
    mentor = await createUserInDb(dbService, { email: MENTOR_EMAIL, role: EUserRole.MENTOR });
    mentee = await createUserInDb(dbService, { email: MENTEE_EMAIL, role: EUserRole.MENTEE });

    draft = dbService.create(MentorshipDraft, {
      title: "Schema draft",
      status: EMentorshipDraftStatus.DRAFT,
      createdBy: author,
    });
    await dbService.flush();
  });

  it("refuses a second change for the same person in one draft", async () => {
    await persist(buildItem());
    dbService.clear();

    dbService.persist(
      dbService.create(MentorshipDraftItem, {
        draft: draft.id,
        operation: EMentorshipDraftOperation.UNASSIGN,
        subordinate: mentee.id,
        proposedSupervisor: null,
      }),
    );

    await expect(dbService.flush()).rejects.toThrow(
      /mentorship_draft_items_draft_id_subordinate_id_unique/,
    );
    dbService.clear();
  });

  it("refuses an unassign that names a proposed supervisor", async () => {
    dbService.persist(buildItem({ operation: EMentorshipDraftOperation.UNASSIGN }));

    await expect(dbService.flush()).rejects.toThrow(
      /mentorship_draft_items_proposed_supervisor_check/,
    );
    dbService.clear();
  });
});
