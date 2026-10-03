import { HttpStatus, type INestApplication } from "@nestjs/common";

import type { Connection, EntityManager, IDatabaseDriver, MikroORM } from "@mikro-orm/core";

import dayjs from "dayjs";
import request from "supertest";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { Mentorship } from "@/common/entities/mentorships.entity";
import { Permission } from "@/common/entities/permissions.entity";
import { UserPermissionOverride } from "@/common/entities/user-permission-overrides.entity";
import { User } from "@/common/entities/users.entity";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipRelationshipType,
  EMentorshipStatus,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { EMentorshipDraftAction } from "@/modules/mentorship-drafts/mentorship-drafts.enums";
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
  APPROVE_PATH,
  CANCEL_PATH,
  CHANGE_SUMMARY_PATH,
  DECISION_COMMENT,
  DRAFT_TITLE,
  E2E_PASSWORD,
  FREE_MENTEE_EMAIL,
  INVALID_ITEMS_ERROR_CODE,
  LEAVING_MENTEE_EMAIL,
  MENTEE_EMAIL,
  MENTOR_EMAIL,
  MENTORSHIP_DRAFTS_ROUTE,
  MY_PERMISSIONS_ROUTE,
  NEW_DRAFT_TITLE,
  OTHER_DRAFT_TITLE,
  OTHER_MENTOR_EMAIL,
  OTHER_SENSEI_EMAIL,
  PUBLISH_PATH,
  REJECT_PATH,
  SENSEI_EMAIL,
  STALE_ITEMS_ERROR_CODE,
  SUBMIT_PATH,
  SUBMITTED_DRAFT_TITLE,
  SUPERADMIN_EMAIL,
  USERS_ROUTE,
} from "./mentorship-drafts.e2e-spec.constants";

describe("Mentorship drafts (E2E)", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  let superadmin: User;
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

  const submitDraftAs = async (email: string, draftId: string, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .post(`${MENTORSHIP_DRAFTS_ROUTE}/${draftId}/${SUBMIT_PATH}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedStatus);
  };

  const postDecision = (token: string, draftId: string, path: string, body: object) =>
    request(httpServer)
      .post(`${MENTORSHIP_DRAFTS_ROUTE}/${draftId}/${path}`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);

  const decideDraftAs = async (
    email: string,
    draftId: string,
    path: string,
    body: object,
    expectedStatus: HttpStatus,
  ) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return postDecision(token, draftId, path, body).expect(expectedStatus);
  };

  const findDraftStatus = async (draftId: string): Promise<EMentorshipDraftStatus> =>
    (await dbService.fork().findOneOrFail(MentorshipDraft, { id: draftId })).status;

  const arrangeSubmittedDraft = async (email: string, items: object[]): Promise<string> => {
    const draftId = await arrangeDraft(email, DRAFT_TITLE, items);
    await submitDraftAs(email, draftId, HttpStatus.OK);

    return draftId;
  };

  const arrangeMenteeMovedByAnotherDraft = async (): Promise<string> => {
    const movingDraftId = await arrangeDraft(OTHER_SENSEI_EMAIL, OTHER_DRAFT_TITLE, []);
    const em = dbService.fork();

    await em.nativeUpdate(
      Mentorship,
      { id: mentorToMentee.id },
      {
        status: EMentorshipStatus.ENDED,
        endedAt: dayjs().toDate(),
        endedByDraft: movingDraftId,
      },
    );
    em.create(Mentorship, {
      supervisor: otherMentor,
      subordinate: mentee,
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      status: EMentorshipStatus.ACTIVE,
      startedAt: dayjs().toDate(),
      startedByDraft: movingDraftId,
    });
    await em.flush();

    return movingDraftId;
  };

  const arrangeApprovedDraft = async (items: object[]): Promise<string> => {
    const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, items);
    await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.OK);

    return draftId;
  };

  const publishDraftAs = async (email: string, draftId: string, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return postDecision(token, draftId, PUBLISH_PATH, {}).expect(expectedStatus);
  };

  const findMentorshipsOf = (subordinates: User[]) =>
    dbService
      .fork()
      .find(Mentorship, { subordinate: { $in: subordinates.map((subordinate) => subordinate.id) } })
      .then((mentorships) =>
        mentorships.map((mentorship) => ({
          supervisorId: mentorship.supervisor.id,
          subordinateId: mentorship.subordinate.id,
          relationshipType: mentorship.relationshipType,
          status: mentorship.status,
          startedByDraftId: mentorship.startedByDraft?.id ?? null,
          endedByDraftId: mentorship.endedByDraft?.id ?? null,
        })),
      );

  const readUserAs = async (email: string, userId: string, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .get(`${USERS_ROUTE}/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedStatus);
  };

  const getDraftAs = async (email: string, draftId: string, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .get(`${MENTORSHIP_DRAFTS_ROUTE}/${draftId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedStatus);
  };

  const getChangeSummaryAs = async (email: string, draftId: string, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .get(`${MENTORSHIP_DRAFTS_ROUTE}/${draftId}/${CHANGE_SUMMARY_PATH}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedStatus);
  };

  const listDraftsAs = async (email: string, query: object, expectedStatus: HttpStatus) => {
    const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

    return request(httpServer)
      .get(MENTORSHIP_DRAFTS_ROUTE)
      .query(query)
      .set("Authorization", `Bearer ${token}`)
      .expect(expectedStatus);
  };

  const arrangeDraft = async (email: string, title: string, items: object[]): Promise<string> => {
    const response = await createDraftAs(email, { title, items }, HttpStatus.CREATED);

    return response.body.data.id;
  };

  const revokePermission = async (user: User, code: EPermissionCode): Promise<void> => {
    const permission = await dbService.findOneOrFail(Permission, { code });
    dbService.create(UserPermissionOverride, {
      user,
      permission,
      effect: EPermissionOverrideEffect.REVOKE,
    });
    await dbService.flush();
  };

  const person = (user: User, role: EUserRole) => ({ id: user.id, name: user.name, role });

  const countItems = (draftId: string): Promise<number> =>
    dbService.fork().count(MentorshipDraftItem, { draft: draftId });

  beforeEach(async () => {
    await truncateTables(dbService);
    dbService.clear();
    await seedPermissionCatalogInDb(dbService);

    superadmin = await arrangeUser(SUPERADMIN_EMAIL, EUserRole.SUPERADMIN);
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

  describe("POST /mentorship-drafts/:id/submit", () => {
    let draftId: string;

    beforeEach(async () => {
      draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [assign(freeMentee, mentor)]);
    });

    it("returns OK(200) with the draft IN_REVIEW, its submit time and the author's actions", async () => {
      const response = await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: draftId,
          status: EMentorshipDraftStatus.IN_REVIEW,
          submittedAt: expect.any(String),
          allowedActions: [EMentorshipDraftAction.CANCEL],
        }),
      );
    });

    it("fails with FORBIDDEN(403) for a Sensei who is not the author", async () => {
      await submitDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.FORBIDDEN);
    });

    it("fails with CONFLICT(409) when the draft is already submitted", async () => {
      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.CONFLICT);
    });

    it("fails with BAD_REQUEST(400) for a draft with no changes", async () => {
      const emptyDraftId = await arrangeDraft(SENSEI_EMAIL, OTHER_DRAFT_TITLE, []);

      await submitDraftAs(SENSEI_EMAIL, emptyDraftId, HttpStatus.BAD_REQUEST);
    });

    it("fails with BAD_REQUEST(400) when a change is no longer valid, leaving the draft in DRAFT", async () => {
      await arrangeMentorship(otherMentor, freeMentee, EMentorshipRelationshipType.MENTOR_MENTEE);

      const response = await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.BAD_REQUEST);

      expect(response.body.errorCode).toBe(INVALID_ITEMS_ERROR_CODE);
      expect(response.body.errors).toEqual([
        { subordinateId: freeMentee.id, violations: [EMentorshipViolation.ALREADY_ASSIGNED] },
      ]);
      expect((await dbService.fork().findOneOrFail(MentorshipDraft, { id: draftId })).status).toBe(
        EMentorshipDraftStatus.DRAFT,
      );
    });
  });

  describe("GET /mentorship-drafts/:id", () => {
    let draftId: string;

    beforeEach(async () => {
      draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [
        assign(freeMentee, mentor),
        unassign(mentee),
      ]);
    });

    it("returns OK(200) with people's names and roles, the actors, timestamps and actions", async () => {
      const response = await getDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual({
        id: draftId,
        title: DRAFT_TITLE,
        status: EMentorshipDraftStatus.DRAFT,
        createdBy: person(sensei, EUserRole.SENSEI),
        itemCount: 2,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        submittedAt: null,
        decidedAt: null,
        publishedAt: null,
        cancelledAt: null,
        allowedActions: [
          EMentorshipDraftAction.EDIT,
          EMentorshipDraftAction.SUBMIT,
          EMentorshipDraftAction.CANCEL,
        ],
        reviewedBy: null,
        approvedBy: null,
        publishedBy: null,
        cancelledBy: null,
        decisionComment: null,
        items: [
          {
            id: expect.any(String),
            operation: EMentorshipDraftOperation.ASSIGN,
            subordinate: person(freeMentee, EUserRole.MENTEE),
            proposedSupervisor: person(mentor, EUserRole.MENTOR),
            expectedCurrentMentorshipId: null,
          },
          {
            id: expect.any(String),
            operation: EMentorshipDraftOperation.UNASSIGN,
            subordinate: person(mentee, EUserRole.MENTEE),
            proposedSupervisor: null,
            expectedCurrentMentorshipId: mentorToMentee.id,
          },
        ],
      });
    });

    it("fails with NOT_FOUND(404) for another Sensei until the draft is submitted", async () => {
      await getDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.NOT_FOUND);

      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);
      const response = await getDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data.allowedActions).toEqual([
        EMentorshipDraftAction.APPROVE,
        EMentorshipDraftAction.REJECT,
      ]);
    });

    it("fails with NOT_FOUND(404) for the superadmin until the draft is submitted", async () => {
      await getDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.NOT_FOUND);

      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);
      const response = await getDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data.allowedActions).toEqual([
        EMentorshipDraftAction.APPROVE,
        EMentorshipDraftAction.REJECT,
      ]);
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot read drafts", async (email) => {
      await getDraftAs(email, draftId, HttpStatus.FORBIDDEN);
    });

    it("fails with FORBIDDEN(403) for a Sensei whose can_read_draft is revoked", async () => {
      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);
      await revokePermission(otherSensei, EPermissionCode.CAN_READ_DRAFT);

      await getDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.FORBIDDEN);
    });
  });

  describe("GET /mentorship-drafts", () => {
    let ownDraftId: string;
    let otherDraftId: string;
    let submittedDraftId: string;

    beforeEach(async () => {
      ownDraftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [assign(freeMentee, mentor)]);
      otherDraftId = await arrangeDraft(OTHER_SENSEI_EMAIL, OTHER_DRAFT_TITLE, [
        assign(freeMentee, otherMentor),
      ]);
      submittedDraftId = await arrangeDraft(OTHER_SENSEI_EMAIL, SUBMITTED_DRAFT_TITLE, [
        assign(freeMentee, mentor),
        unassign(mentee),
      ]);
      await submitDraftAs(OTHER_SENSEI_EMAIL, submittedDraftId, HttpStatus.OK);
    });

    const listedIds = (response: request.Response): string[] =>
      response.body.data.data.map((draft: { id: string }) => draft.id);

    it("returns OK(200) with a Sensei's own drafts and other people's submitted ones", async () => {
      const response = await listDraftsAs(SENSEI_EMAIL, {}, HttpStatus.OK);

      expect(listedIds(response).sort()).toEqual([ownDraftId, submittedDraftId].sort());
      expect(response.body.data.data).toContainEqual(
        expect.objectContaining({
          id: submittedDraftId,
          title: SUBMITTED_DRAFT_TITLE,
          status: EMentorshipDraftStatus.IN_REVIEW,
          createdBy: person(otherSensei, EUserRole.SENSEI),
          itemCount: 2,
          allowedActions: [EMentorshipDraftAction.APPROVE, EMentorshipDraftAction.REJECT],
        }),
      );
    });

    it("returns OK(200) with only the caller's drafts when mine=true", async () => {
      const response = await listDraftsAs(OTHER_SENSEI_EMAIL, { mine: true }, HttpStatus.OK);

      expect(listedIds(response).sort()).toEqual([otherDraftId, submittedDraftId].sort());
    });

    it("returns OK(200) filtered by status", async () => {
      const response = await listDraftsAs(
        SENSEI_EMAIL,
        { status: EMentorshipDraftStatus.IN_REVIEW },
        HttpStatus.OK,
      );

      expect(listedIds(response)).toEqual([submittedDraftId]);
    });

    it("returns OK(200) one page at a time with the total", async () => {
      const response = await listDraftsAs(OTHER_SENSEI_EMAIL, { page: 2, limit: 1 }, HttpStatus.OK);

      expect(listedIds(response)).toEqual([otherDraftId]);
      expect(response.body.data.meta).toEqual({ total: 2, page: 2, limit: 1, totalPages: 2 });
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot read drafts", async (email) => {
      await listDraftsAs(email, {}, HttpStatus.FORBIDDEN);
    });
  });

  describe("POST /mentorship-drafts/:id/approve", () => {
    let draftId: string;

    beforeEach(async () => {
      draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [
        assign(freeMentee, mentor),
        reassign(mentee, otherMentor),
      ]);
    });

    it("returns OK(200) for another Sensei, recording who approved, when and the note", async () => {
      const response = await decideDraftAs(
        OTHER_SENSEI_EMAIL,
        draftId,
        APPROVE_PATH,
        { decisionComment: DECISION_COMMENT },
        HttpStatus.OK,
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: draftId,
          status: EMentorshipDraftStatus.APPROVED,
          approvedBy: person(otherSensei, EUserRole.SENSEI),
          reviewedBy: null,
          decidedAt: expect.any(String),
          decisionComment: DECISION_COMMENT,
          allowedActions: [],
        }),
      );
    });

    it("returns OK(200) for the superadmin, storing no note when none is sent", async () => {
      const response = await decideDraftAs(
        SUPERADMIN_EMAIL,
        draftId,
        APPROVE_PATH,
        {},
        HttpStatus.OK,
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: EMentorshipDraftStatus.APPROVED,
          approvedBy: person(superadmin, EUserRole.SUPERADMIN),
          decisionComment: null,
        }),
      );
    });

    it("fails with FORBIDDEN(403) when a Sensei approves a draft they created", async () => {
      await decideDraftAs(SENSEI_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.FORBIDDEN);

      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.IN_REVIEW);
    });

    it("fails with FORBIDDEN(403) when the superadmin approves a draft they created", async () => {
      const ownDraftId = await arrangeSubmittedDraft(SUPERADMIN_EMAIL, [
        assign(freeMentee, otherMentor),
      ]);

      await decideDraftAs(SUPERADMIN_EMAIL, ownDraftId, APPROVE_PATH, {}, HttpStatus.FORBIDDEN);
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot approve drafts", async (email) => {
      await decideDraftAs(email, draftId, APPROVE_PATH, {}, HttpStatus.FORBIDDEN);
    });

    it("fails with NOT_FOUND(404) for someone else's draft that has not been submitted", async () => {
      const unsubmittedDraftId = await arrangeDraft(SENSEI_EMAIL, OTHER_DRAFT_TITLE, [
        assign(freeMentee, otherMentor),
      ]);

      await decideDraftAs(
        OTHER_SENSEI_EMAIL,
        unsubmittedDraftId,
        APPROVE_PATH,
        {},
        HttpStatus.NOT_FOUND,
      );
    });

    it("fails with CONFLICT(409) once the draft has been decided", async () => {
      await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.OK);

      await decideDraftAs(SUPERADMIN_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.CONFLICT);
    });

    it("lets exactly one of two simultaneous approvals through", async () => {
      const tokens = await Promise.all(
        [OTHER_SENSEI_EMAIL, SUPERADMIN_EMAIL].map((email) =>
          getBearerToken(httpServer, email, E2E_PASSWORD),
        ),
      );

      const responses = await Promise.all(
        tokens.map((token) => postDecision(token, draftId, APPROVE_PATH, {})),
      );

      expect(responses.map((response) => response.status).sort()).toEqual([
        HttpStatus.OK,
        HttpStatus.CONFLICT,
      ]);
    });

    it("fails with CONFLICT(409) naming the stale change when the draft is out of date", async () => {
      const movingDraftId = await arrangeMenteeMovedByAnotherDraft();

      const response = await decideDraftAs(
        OTHER_SENSEI_EMAIL,
        draftId,
        APPROVE_PATH,
        {},
        HttpStatus.CONFLICT,
      );

      expect(response.body.errorCode).toBe(STALE_ITEMS_ERROR_CODE);
      expect(response.body.errors).toEqual([
        {
          subordinateId: mentee.id,
          expectedSupervisorId: mentor.id,
          currentSupervisorId: otherMentor.id,
          changedByDraftId: movingDraftId,
        },
      ]);
      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.IN_REVIEW);
    });
  });

  describe("POST /mentorship-drafts/:id/reject", () => {
    let draftId: string;

    beforeEach(async () => {
      draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [reassign(mentee, otherMentor)]);
    });

    it("returns OK(200) for another Sensei, recording who rejected, when and the note", async () => {
      const response = await decideDraftAs(
        OTHER_SENSEI_EMAIL,
        draftId,
        REJECT_PATH,
        { decisionComment: DECISION_COMMENT },
        HttpStatus.OK,
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: EMentorshipDraftStatus.REJECTED,
          reviewedBy: person(otherSensei, EUserRole.SENSEI),
          approvedBy: null,
          decidedAt: expect.any(String),
          decisionComment: DECISION_COMMENT,
          allowedActions: [],
        }),
      );
    });

    it("returns OK(200) for the superadmin", async () => {
      const response = await decideDraftAs(
        SUPERADMIN_EMAIL,
        draftId,
        REJECT_PATH,
        {},
        HttpStatus.OK,
      );

      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: EMentorshipDraftStatus.REJECTED,
          reviewedBy: person(superadmin, EUserRole.SUPERADMIN),
        }),
      );
    });

    it("returns OK(200) for a draft that is out of date", async () => {
      await arrangeMenteeMovedByAnotherDraft();

      await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, REJECT_PATH, {}, HttpStatus.OK);
    });

    it("fails with FORBIDDEN(403) when a Sensei rejects a draft they created", async () => {
      await decideDraftAs(SENSEI_EMAIL, draftId, REJECT_PATH, {}, HttpStatus.FORBIDDEN);

      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.IN_REVIEW);
    });

    it("fails with CONFLICT(409) for a rejected draft, which stays rejected", async () => {
      await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, REJECT_PATH, {}, HttpStatus.OK);

      await decideDraftAs(SUPERADMIN_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.CONFLICT);
      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.REJECTED);
    });
  });

  describe("GET /mentorship-drafts/:id/change-summary", () => {
    const summaryItem = (fields: object) => ({
      id: expect.any(String),
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      violations: [],
      stale: null,
      overlaps: [],
      ...fields,
    });

    it("returns OK(200) with each change as before and after", async () => {
      const leavingMentee = await arrangeUser(LEAVING_MENTEE_EMAIL, EUserRole.MENTEE);
      await arrangeMentorship(
        otherMentor,
        leavingMentee,
        EMentorshipRelationshipType.MENTOR_MENTEE,
      );
      const draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [
        assign(freeMentee, mentor),
        reassign(mentee, otherMentor),
        unassign(leavingMentee),
      ]);

      const response = await getChangeSummaryAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual({
        draftId,
        items: [
          summaryItem({
            operation: EMentorshipDraftOperation.ASSIGN,
            subordinate: person(freeMentee, EUserRole.MENTEE),
            expectedSupervisor: null,
            currentSupervisor: null,
            proposedSupervisor: person(mentor, EUserRole.MENTOR),
          }),
          summaryItem({
            operation: EMentorshipDraftOperation.UNASSIGN,
            subordinate: person(leavingMentee, EUserRole.MENTEE),
            expectedSupervisor: person(otherMentor, EUserRole.MENTOR),
            currentSupervisor: person(otherMentor, EUserRole.MENTOR),
            proposedSupervisor: null,
          }),
          summaryItem({
            operation: EMentorshipDraftOperation.REASSIGN,
            subordinate: person(mentee, EUserRole.MENTEE),
            expectedSupervisor: person(mentor, EUserRole.MENTOR),
            currentSupervisor: person(mentor, EUserRole.MENTOR),
            proposedSupervisor: person(otherMentor, EUserRole.MENTOR),
          }),
        ],
      });
    });

    it("returns OK(200) naming the draft that moved a person once the draft is out of date", async () => {
      const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [reassign(mentee, otherMentor)]);
      const movingDraftId = await arrangeMenteeMovedByAnotherDraft();

      const response = await getChangeSummaryAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data.items).toEqual([
        summaryItem({
          operation: EMentorshipDraftOperation.REASSIGN,
          subordinate: person(mentee, EUserRole.MENTEE),
          expectedSupervisor: person(mentor, EUserRole.MENTOR),
          currentSupervisor: person(otherMentor, EUserRole.MENTOR),
          proposedSupervisor: person(otherMentor, EUserRole.MENTOR),
          violations: [EMentorshipViolation.SAME_SUPERVISOR],
          stale: { changedByDraftId: movingDraftId },
        }),
      ]);
    });

    it("returns OK(200) listing other submitted drafts that change the same person", async () => {
      const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [reassign(mentee, otherMentor)]);
      const overlappingDraftId = await arrangeDraft(OTHER_SENSEI_EMAIL, SUBMITTED_DRAFT_TITLE, [
        unassign(mentee),
      ]);
      await submitDraftAs(OTHER_SENSEI_EMAIL, overlappingDraftId, HttpStatus.OK);
      await arrangeDraft(OTHER_SENSEI_EMAIL, OTHER_DRAFT_TITLE, [unassign(mentee)]);

      const response = await getChangeSummaryAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data.items[0].overlaps).toEqual([
        {
          id: overlappingDraftId,
          title: SUBMITTED_DRAFT_TITLE,
          status: EMentorshipDraftStatus.IN_REVIEW,
        },
      ]);
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot read drafts", async (email) => {
      const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [assign(freeMentee, mentor)]);

      await getChangeSummaryAs(email, draftId, HttpStatus.FORBIDDEN);
    });

    it("fails with NOT_FOUND(404) for another Sensei until the draft is submitted", async () => {
      const draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [assign(freeMentee, mentor)]);

      await getChangeSummaryAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.NOT_FOUND);
    });
  });

  describe("POST /mentorship-drafts/:id/publish", () => {
    const row = (
      supervisor: User,
      subordinate: User,
      status: EMentorshipStatus,
      draftIds: { startedByDraftId?: string; endedByDraftId?: string } = {},
    ) => ({
      supervisorId: supervisor.id,
      subordinateId: subordinate.id,
      relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
      status,
      startedByDraftId: draftIds.startedByDraftId ?? null,
      endedByDraftId: draftIds.endedByDraftId ?? null,
    });

    it("runs the whole Draft → Review → Approval → Publish flow through the API", async () => {
      const leavingMentee = await arrangeUser(LEAVING_MENTEE_EMAIL, EUserRole.MENTEE);
      await arrangeMentorship(
        otherMentor,
        leavingMentee,
        EMentorshipRelationshipType.MENTOR_MENTEE,
      );
      const draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, [
        assign(freeMentee, mentor),
        reassign(mentee, otherMentor),
        unassign(leavingMentee),
      ]);
      await submitDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);
      await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, APPROVE_PATH, {}, HttpStatus.OK);

      const approved = await getDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);
      expect(approved.body.data.allowedActions).toEqual([
        EMentorshipDraftAction.PUBLISH,
        EMentorshipDraftAction.CANCEL,
      ]);

      const response = await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: EMentorshipDraftStatus.PUBLISHED,
          createdBy: person(sensei, EUserRole.SENSEI),
          approvedBy: person(otherSensei, EUserRole.SENSEI),
          publishedBy: person(superadmin, EUserRole.SUPERADMIN),
          submittedAt: expect.any(String),
          decidedAt: expect.any(String),
          publishedAt: expect.any(String),
          allowedActions: [],
        }),
      );

      const mentorships = await findMentorshipsOf([freeMentee, mentee, leavingMentee]);

      expect(mentorships).toHaveLength(4);
      expect(mentorships).toEqual(
        expect.arrayContaining([
          row(mentor, freeMentee, EMentorshipStatus.ACTIVE, { startedByDraftId: draftId }),
          row(mentor, mentee, EMentorshipStatus.ENDED, { endedByDraftId: draftId }),
          row(otherMentor, mentee, EMentorshipStatus.ACTIVE, { startedByDraftId: draftId }),
          row(otherMentor, leavingMentee, EMentorshipStatus.ENDED, { endedByDraftId: draftId }),
        ]),
      );
    });

    it("fails with FORBIDDEN(403) for a Sensei", async () => {
      const draftId = await arrangeApprovedDraft([assign(freeMentee, mentor)]);

      await publishDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.FORBIDDEN);

      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.APPROVED);
    });

    it("fails with CONFLICT(409) for a draft that has not been approved", async () => {
      const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, [assign(freeMentee, mentor)]);

      await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);

      expect(await findMentorshipsOf([freeMentee])).toEqual([]);
    });

    it("fails with CONFLICT(409) naming the stale change, applying nothing", async () => {
      const draftId = await arrangeApprovedDraft([
        assign(freeMentee, mentor),
        reassign(mentee, otherMentor),
      ]);
      const movingDraftId = await arrangeMenteeMovedByAnotherDraft();

      const response = await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);

      expect(response.body.errorCode).toBe(STALE_ITEMS_ERROR_CODE);
      expect(response.body.errors).toEqual([
        {
          subordinateId: mentee.id,
          expectedSupervisorId: mentor.id,
          currentSupervisorId: otherMentor.id,
          changedByDraftId: movingDraftId,
        },
      ]);
      expect(await findMentorshipsOf([freeMentee])).toEqual([]);
      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.APPROVED);
    });

    it("fails with CONFLICT(409) when someone in the draft was deactivated after approval", async () => {
      const draftId = await arrangeApprovedDraft([assign(freeMentee, mentor)]);
      await dbService
        .fork()
        .nativeUpdate(User, { id: freeMentee.id }, { state: EUserState.INACTIVE });

      const response = await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);

      expect(response.body.errorCode).toBe(INVALID_ITEMS_ERROR_CODE);
      expect(response.body.errors).toEqual([
        { subordinateId: freeMentee.id, violations: [EMentorshipViolation.INACTIVE_USER] },
      ]);
      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.APPROVED);
    });

    it("lets exactly one of two simultaneous publishes that move the same person through", async () => {
      const reassignDraftId = await arrangeApprovedDraft([reassign(mentee, otherMentor)]);
      const unassignDraftId = await arrangeApprovedDraft([unassign(mentee)]);
      const token = await getBearerToken(httpServer, SUPERADMIN_EMAIL, E2E_PASSWORD);

      const responses = await Promise.all(
        [reassignDraftId, unassignDraftId].map((draftId) =>
          postDecision(token, draftId, PUBLISH_PATH, {}),
        ),
      );

      expect(responses.map((response) => response.status).sort()).toEqual([
        HttpStatus.OK,
        HttpStatus.CONFLICT,
      ]);
      expect(
        responses.find((response) => response.status === HttpStatus.CONFLICT)?.body.errorCode,
      ).toBe(STALE_ITEMS_ERROR_CODE);
    });

    it("moves access on the next request: the old Mentor loses the Mentee, the new one gains them", async () => {
      const draftId = await arrangeApprovedDraft([reassign(mentee, otherMentor)]);
      await readUserAs(MENTOR_EMAIL, mentee.id, HttpStatus.OK);
      await readUserAs(OTHER_MENTOR_EMAIL, mentee.id, HttpStatus.FORBIDDEN);

      await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);

      await readUserAs(MENTOR_EMAIL, mentee.id, HttpStatus.FORBIDDEN);
      await readUserAs(OTHER_MENTOR_EMAIL, mentee.id, HttpStatus.OK);
    });
  });

  describe("POST /mentorship-drafts/:id/cancel", () => {
    const changes = () => [assign(freeMentee, mentor)];

    const cancelDraftAs = async (email: string, draftId: string, expectedStatus: HttpStatus) => {
      const token = await getBearerToken(httpServer, email, E2E_PASSWORD);

      return postDecision(token, draftId, CANCEL_PATH, {}).expect(expectedStatus);
    };

    it.each([
      [EMentorshipDraftStatus.DRAFT, () => arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, changes())],
      [EMentorshipDraftStatus.IN_REVIEW, () => arrangeSubmittedDraft(SENSEI_EMAIL, changes())],
      [EMentorshipDraftStatus.APPROVED, () => arrangeApprovedDraft(changes())],
    ])("returns OK(200) for the author of a %s draft, recording who cancelled and when", async (_status, arrange) => {
      const draftId = await arrange();

      const response = await cancelDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          id: draftId,
          status: EMentorshipDraftStatus.CANCELLED,
          cancelledBy: person(sensei, EUserRole.SENSEI),
          cancelledAt: expect.any(String),
          allowedActions: [],
        }),
      );
    });

    it.each([
      [
        EMentorshipDraftStatus.PUBLISHED,
        async () => {
          const draftId = await arrangeApprovedDraft(changes());
          await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);

          return draftId;
        },
      ],
      [
        EMentorshipDraftStatus.REJECTED,
        async () => {
          const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, changes());
          await decideDraftAs(OTHER_SENSEI_EMAIL, draftId, REJECT_PATH, {}, HttpStatus.OK);

          return draftId;
        },
      ],
      [
        EMentorshipDraftStatus.CANCELLED,
        async () => {
          const draftId = await arrangeDraft(SENSEI_EMAIL, DRAFT_TITLE, changes());
          await cancelDraftAs(SENSEI_EMAIL, draftId, HttpStatus.OK);

          return draftId;
        },
      ],
    ])("fails with CONFLICT(409) for the author of a %s draft, which keeps its status", async (status, arrange) => {
      const draftId = await arrange();

      await cancelDraftAs(SENSEI_EMAIL, draftId, HttpStatus.CONFLICT);

      expect(await findDraftStatus(draftId)).toBe(status);
    });

    it("fails with FORBIDDEN(403) for a Sensei who is not the author", async () => {
      const draftId = await arrangeApprovedDraft(changes());

      await cancelDraftAs(OTHER_SENSEI_EMAIL, draftId, HttpStatus.FORBIDDEN);

      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.APPROVED);
    });

    it("returns OK(200) for the superadmin on someone else's approved draft that is out of date", async () => {
      const draftId = await arrangeApprovedDraft([reassign(mentee, otherMentor)]);
      await arrangeMenteeMovedByAnotherDraft();
      await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);

      const response = await cancelDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.OK);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          status: EMentorshipDraftStatus.CANCELLED,
          createdBy: person(sensei, EUserRole.SENSEI),
          approvedBy: person(otherSensei, EUserRole.SENSEI),
          cancelledBy: person(superadmin, EUserRole.SUPERADMIN),
          cancelledAt: expect.any(String),
          allowedActions: [],
        }),
      );
      await publishDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);
    });

    it("fails with CONFLICT(409) for the superadmin on someone else's draft that is still in review", async () => {
      const draftId = await arrangeSubmittedDraft(SENSEI_EMAIL, changes());

      await cancelDraftAs(SUPERADMIN_EMAIL, draftId, HttpStatus.CONFLICT);

      expect(await findDraftStatus(draftId)).toBe(EMentorshipDraftStatus.IN_REVIEW);
    });

    it.each([
      MENTOR_EMAIL,
      MENTEE_EMAIL,
    ])("fails with FORBIDDEN(403) for %s, who cannot read drafts", async (email) => {
      const draftId = await arrangeApprovedDraft(changes());

      await cancelDraftAs(email, draftId, HttpStatus.FORBIDDEN);
    });
  });
});
