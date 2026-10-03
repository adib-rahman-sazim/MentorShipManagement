import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";
import request from "supertest";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { Mentorship } from "@/common/entities/mentorships.entity";
import { Permission } from "@/common/entities/permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import type { User } from "@/common/entities/users.entity";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipRelationshipType,
  EMentorshipStatus,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import {
  EPermission,
  EPermissionCode,
  EPermissionOverrideEffect,
  EResource,
} from "@/modules/permissions/permissions.enums";

import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getBearerToken } from "../utils/helpers/bearer-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import { seedPermissionCatalogInDb } from "../utils/helpers/permissions.helpers";
import type { THttpServer } from "../utils/http-server.types";
import {
  DRAFT_TITLE,
  E2E_PASSWORD,
  FREE_MENTEE_EMAIL,
  INVALID_ITEMS_ERROR_CODE,
  MENTEE_EMAIL,
  MENTOR_EMAIL,
  MENTORSHIP_DRAFTS_ROUTE,
  MY_PERMISSIONS_ROUTE,
  NEW_DRAFT_TITLE,
  OTHER_MENTOR_EMAIL,
  OTHER_SENSEI_EMAIL,
  SENSEI_EMAIL,
  SUPERADMIN_EMAIL,
} from "./mentorship-drafts.e2e-spec.constants";

describe("Mentorship drafts (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let sensei: User;
  let otherSensei: User;
  let mentor: User;
  let otherMentor: User;
  let mentee: User;
  let freeMentee: User;
  let mentorToMentee: Mentorship;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer({ withExceptionFilter: true });

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

  const assign = (subordinate: User, supervisor: User) => ({
    operation: EMentorshipDraftOperation.ASSIGN,
    subordinateId: subordinate.id,
    proposedSupervisorId: supervisor.id,
  });

  const reassign = (subordinate: User, supervisor: User) => ({
    operation: EMentorshipDraftOperation.REASSIGN,
    subordinateId: subordinate.id,
    proposedSupervisorId: supervisor.id,
  });

  const unassign = (subordinate: User) => ({
    operation: EMentorshipDraftOperation.UNASSIGN,
    subordinateId: subordinate.id,
  });

  const createDraftAs = async (email: string, body: object, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .post(MENTORSHIP_DRAFTS_ROUTE)
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(expectedStatus);
  };

  const updateDraftAs = async (
    email: string,
    draftId: string,
    body: object,
    expectedStatus: HttpStatus,
  ) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .patch(`${MENTORSHIP_DRAFTS_ROUTE}/${draftId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(body)
      .expect(expectedStatus);
  };

  const countItems = (draftId: string): Promise<number> =>
    dbService.fork().count(MentorshipDraftItem, { draft: draftId });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
    await seedPermissionCatalogInDb(dbService);

    await arrangeUser(SUPERADMIN_EMAIL, EUserRole.SUPERADMIN);
    sensei = await arrangeUser(SENSEI_EMAIL, EUserRole.SENSEI);
    otherSensei = await arrangeUser(OTHER_SENSEI_EMAIL, EUserRole.SENSEI);
    mentor = await arrangeUser(MENTOR_EMAIL, EUserRole.MENTOR);
    otherMentor = await arrangeUser(OTHER_MENTOR_EMAIL, EUserRole.MENTOR);
    mentee = await arrangeUser(MENTEE_EMAIL, EUserRole.MENTEE);
    freeMentee = await arrangeUser(FREE_MENTEE_EMAIL, EUserRole.MENTEE);

    await arrangeMentorship(sensei, mentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    await arrangeMentorship(sensei, otherMentor, EMentorshipRelationshipType.SENSEI_MENTOR);
    mentorToMentee = await arrangeMentorship(
      mentor,
      mentee,
      EMentorshipRelationshipType.MENTOR_MENTEE,
    );
  });

  describe("POST /mentorship-drafts", () => {
    it("returns CREATED(201) with the draft in DRAFT and the live state captured", async () => {
      const response = await createDraftAs(
        SENSEI_EMAIL,
        { title: DRAFT_TITLE, items: [assign(freeMentee, mentor), reassign(mentee, otherMentor)] },
        HttpStatus.CREATED,
      );

      expect(response.body.data).toEqual({
        id: expect.any(String),
        title: DRAFT_TITLE,
        status: EMentorshipDraftStatus.DRAFT,
        createdById: sensei.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        items: [
          {
            id: expect.any(String),
            operation: EMentorshipDraftOperation.ASSIGN,
            subordinateId: freeMentee.id,
            proposedSupervisorId: mentor.id,
            expectedCurrentMentorshipId: null,
          },
          {
            id: expect.any(String),
            operation: EMentorshipDraftOperation.REASSIGN,
            subordinateId: mentee.id,
            proposedSupervisorId: otherMentor.id,
            expectedCurrentMentorshipId: mentorToMentee.id,
          },
        ],
      });
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot create drafts", async (email) => {
      await createDraftAs(
        email,
        { title: DRAFT_TITLE, items: [assign(freeMentee, mentor)] },
        HttpStatus.FORBIDDEN,
      );
    });

    it("fails with BAD_REQUEST(400) naming the person and the reason, saving nothing", async () => {
      const response = await createDraftAs(
        SENSEI_EMAIL,
        { title: DRAFT_TITLE, items: [assign(mentee, otherMentor)] },
        HttpStatus.BAD_REQUEST,
      );

      expect(response.body.errorCode).toBe(INVALID_ITEMS_ERROR_CODE);
      expect(response.body.errors).toEqual([
        { subordinateId: mentee.id, violations: [EMentorshipViolation.ALREADY_ASSIGNED] },
      ]);
      expect(await dbService.fork().count(MentorshipDraft, {})).toBe(0);
    });

    it.each([
      [
        "an unassign names a supervisor",
        () => [{ ...unassign(mentee), proposedSupervisorId: otherMentor.id }],
      ],
      [
        "the same person appears twice",
        () => [assign(freeMentee, mentor), assign(freeMentee, otherMentor)],
      ],
    ])("fails with BAD_REQUEST(400) when %s", async (_, buildItems) => {
      await createDraftAs(
        SENSEI_EMAIL,
        { title: DRAFT_TITLE, items: buildItems() },
        HttpStatus.BAD_REQUEST,
      );
    });

    describe("the mentor_mentee condition on can_assign_mentor", () => {
      it("fails with FORBIDDEN(403) when a Sensei moves a Mentor", async () => {
        await createDraftAs(
          SENSEI_EMAIL,
          { title: DRAFT_TITLE, items: [reassign(mentor, otherSensei)] },
          HttpStatus.FORBIDDEN,
        );
      });

      it("returns CREATED(201) for the superadmin with the same change", async () => {
        await createDraftAs(
          SUPERADMIN_EMAIL,
          { title: DRAFT_TITLE, items: [reassign(mentor, otherSensei)] },
          HttpStatus.CREATED,
        );
      });

      it("fails with FORBIDDEN(403) for a Sensei whose can_assign_mentor is revoked, even for a Mentor → Mentee change", async () => {
        const permission = await dbService.findOneOrFail(Permission, {
          code: EPermissionCode.CAN_ASSIGN_MENTOR,
        });
        dbService.create(UserPermissionOverride, {
          user: sensei,
          permission,
          effect: EPermissionOverrideEffect.REVOKE,
        });
        await dbService.flush();

        await createDraftAs(
          SENSEI_EMAIL,
          { title: DRAFT_TITLE, items: [assign(freeMentee, mentor)] },
          HttpStatus.FORBIDDEN,
        );
      });

      it("sends a Sensei the same condition through GET /permissions/my", async () => {
        const token = await getBearerToken(httpServer, SENSEI_EMAIL, E2E_PASSWORD);

        const response = await request(httpServer)
          .get(MY_PERMISSIONS_ROUTE)
          .set("Authorization", `Bearer ${token}`)
          .expect(HttpStatus.OK);

        expect(response.body.data.rules).toContainEqual({
          action: [EPermission.ASSIGN],
          subject: [EResource.MENTORSHIP],
          conditions: { relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE },
        });
      });
    });
  });

  describe("PATCH /mentorship-drafts/:id", () => {
    let draftId: string;

    beforeEach(async () => {
      const response = await createDraftAs(
        SENSEI_EMAIL,
        { title: DRAFT_TITLE, items: [assign(freeMentee, mentor)] },
        HttpStatus.CREATED,
      );
      draftId = response.body.data.id;
    });

    it("returns OK(200) replacing the title and the whole list of changes", async () => {
      const response = await updateDraftAs(
        SENSEI_EMAIL,
        draftId,
        { title: NEW_DRAFT_TITLE, items: [assign(freeMentee, otherMentor), unassign(mentee)] },
        HttpStatus.OK,
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          title: NEW_DRAFT_TITLE,
          items: [
            expect.objectContaining({
              subordinateId: freeMentee.id,
              proposedSupervisorId: otherMentor.id,
            }),
            expect.objectContaining({
              subordinateId: mentee.id,
              expectedCurrentMentorshipId: mentorToMentee.id,
            }),
          ],
        }),
      );
      expect(await countItems(draftId)).toBe(2);
    });

    it("fails with FORBIDDEN(403) for a Sensei who is not the author", async () => {
      await updateDraftAs(
        OTHER_SENSEI_EMAIL,
        draftId,
        { title: NEW_DRAFT_TITLE },
        HttpStatus.FORBIDDEN,
      );
    });

    it("fails with CONFLICT(409) once the draft is no longer DRAFT", async () => {
      await dbService
        .fork()
        .nativeUpdate(
          MentorshipDraft,
          { id: draftId },
          { status: EMentorshipDraftStatus.IN_REVIEW },
        );

      await updateDraftAs(SENSEI_EMAIL, draftId, { title: NEW_DRAFT_TITLE }, HttpStatus.CONFLICT);
    });
  });
});
