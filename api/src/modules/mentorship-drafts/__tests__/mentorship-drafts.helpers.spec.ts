import { ConflictException, ForbiddenException } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { describe, expect, it } from "vitest";

import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import type { IMentorshipParticipant } from "@/modules/mentorships/mentorships.interfaces";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";

import { EMentorshipDraftAction } from "../mentorship-drafts.enums";
import {
  assertCanAssignDraftItems,
  assertCanCancelDraft,
  assertDraftTransition,
  buildDraftApplyPlan,
  canDecideDraft,
  canTransitionDraft,
  findDraftItemViolations,
  findOperationStateViolations,
  findStaleDraftItems,
  resolveAllowedDraftActions,
  toDecisionComment,
} from "../mentorship-drafts.helpers";
import type {
  IDraftItemExpectation,
  IDraftItemInput,
  IMentorshipSnapshot,
} from "../mentorship-drafts.interfaces";

const participant = (id: string, role: EUserRole): IMentorshipParticipant => ({
  id,
  role,
  state: EUserState.ACTIVE,
  deletedAt: null,
});

const PARTICIPANTS_BY_ID = new Map(
  [
    participant("sensei", EUserRole.SENSEI),
    participant("other-sensei", EUserRole.SENSEI),
    participant("mentor", EUserRole.MENTOR),
    participant("other-mentor", EUserRole.MENTOR),
    participant("mentee", EUserRole.MENTEE),
  ].map((person) => [person.id, person]),
);

const buildAbility = (define: (builder: AbilityBuilder<TAppAbility>) => void): TAppAbility => {
  const builder = new AbilityBuilder<TAppAbility>(createMongoAbility);
  define(builder);

  return builder.build();
};

const SENSEI_ABILITY = buildAbility(({ can }) =>
  can(EPermission.ASSIGN, EResource.MENTORSHIP, {
    relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
  }),
);
const SUPERADMIN_ABILITY = buildAbility(({ can }) => can(EPermission.MANAGE, "all"));

const assign = (subordinateId: string, proposedSupervisorId: string): IDraftItemInput => ({
  operation: EMentorshipDraftOperation.ASSIGN,
  subordinateId,
  proposedSupervisorId,
});

const reassign = (subordinateId: string, proposedSupervisorId: string): IDraftItemInput => ({
  operation: EMentorshipDraftOperation.REASSIGN,
  subordinateId,
  proposedSupervisorId,
});

describe("findOperationStateViolations", () => {
  it.each([
    [EMentorshipDraftOperation.ASSIGN, undefined, "mentor", []],
    [
      EMentorshipDraftOperation.ASSIGN,
      "mentor",
      "other-mentor",
      [EMentorshipViolation.ALREADY_ASSIGNED],
    ],
    [EMentorshipDraftOperation.REASSIGN, "mentor", "other-mentor", []],
    [EMentorshipDraftOperation.REASSIGN, undefined, "mentor", [EMentorshipViolation.NOT_ASSIGNED]],
    [
      EMentorshipDraftOperation.REASSIGN,
      "mentor",
      "mentor",
      [EMentorshipViolation.SAME_SUPERVISOR],
    ],
    [EMentorshipDraftOperation.UNASSIGN, "mentor", null, []],
    [EMentorshipDraftOperation.UNASSIGN, undefined, null, [EMentorshipViolation.NOT_ASSIGNED]],
  ])("%s with current %s and proposed %s returns %j", (operation, current, proposed, expected) => {
    expect(findOperationStateViolations(operation, current, proposed)).toEqual(expected);
  });
});

describe("findDraftItemViolations", () => {
  const findViolations = (
    items: IDraftItemInput[],
    supervisorBySubordinate = new Map<string, string>(),
  ) =>
    findDraftItemViolations({
      items,
      participantsById: PARTICIPANTS_BY_ID,
      supervisorBySubordinate,
    });

  it("returns nothing for valid changes", () => {
    expect(
      findViolations(
        [assign("mentee", "mentor"), reassign("mentor", "other-sensei")],
        new Map([["mentor", "sensei"]]),
      ),
    ).toEqual([]);
  });

  it("names the person and every reason", () => {
    expect(findViolations([assign("mentee", "sensei")], new Map([["mentee", "mentor"]]))).toEqual([
      {
        subordinateId: "mentee",
        violations: [EMentorshipViolation.ALREADY_ASSIGNED, EMentorshipViolation.ILLEGAL_ROLE_PAIR],
      },
    ]);
  });

  it("reports an unknown person as USER_NOT_FOUND", () => {
    expect(findViolations([assign("mentee", "ghost")])).toEqual([
      { subordinateId: "mentee", violations: [EMentorshipViolation.USER_NOT_FOUND] },
    ]);
  });

  it("catches a loop that only the two items together create", () => {
    const violations = findViolations([
      assign("mentor", "other-mentor"),
      assign("other-mentor", "mentor"),
    ]);

    expect(violations).toHaveLength(2);
    for (const { violations: itemViolations } of violations) {
      expect(itemViolations).toContain(EMentorshipViolation.CYCLE);
    }
  });
});

describe("assertCanAssignDraftItems", () => {
  it("refuses with 403 when the condition does not cover a Mentor change", () => {
    expect(() =>
      assertCanAssignDraftItems(
        [reassign("mentor", "other-sensei")],
        PARTICIPANTS_BY_ID,
        SENSEI_ABILITY,
      ),
    ).toThrow(ForbiddenException);
  });

  it("allows a Mentor to Mentee change under the condition", () => {
    expect(() =>
      assertCanAssignDraftItems([assign("mentee", "mentor")], PARTICIPANTS_BY_ID, SENSEI_ABILITY),
    ).not.toThrow();
  });

  it("allows a Mentor change for an unconditional ability", () => {
    expect(() =>
      assertCanAssignDraftItems(
        [reassign("mentor", "other-sensei")],
        PARTICIPANTS_BY_ID,
        SUPERADMIN_ABILITY,
      ),
    ).not.toThrow();
  });
});

const ALLOWED_TRANSITIONS = new Set([
  `${EMentorshipDraftStatus.DRAFT}>${EMentorshipDraftStatus.IN_REVIEW}`,
  `${EMentorshipDraftStatus.DRAFT}>${EMentorshipDraftStatus.CANCELLED}`,
  `${EMentorshipDraftStatus.IN_REVIEW}>${EMentorshipDraftStatus.APPROVED}`,
  `${EMentorshipDraftStatus.IN_REVIEW}>${EMentorshipDraftStatus.REJECTED}`,
  `${EMentorshipDraftStatus.IN_REVIEW}>${EMentorshipDraftStatus.CANCELLED}`,
  `${EMentorshipDraftStatus.APPROVED}>${EMentorshipDraftStatus.PUBLISHED}`,
  `${EMentorshipDraftStatus.APPROVED}>${EMentorshipDraftStatus.CANCELLED}`,
]);

const STATUS_PAIRS = Object.values(EMentorshipDraftStatus).flatMap((from) =>
  Object.values(EMentorshipDraftStatus).map((to) => ({
    from,
    to,
    isAllowed: ALLOWED_TRANSITIONS.has(`${from}>${to}`),
  })),
);

const SENSEI_DRAFT_ABILITY = buildAbility(({ can }) => {
  can(EPermission.CREATE, EResource.DRAFT);
  can(EPermission.READ, EResource.DRAFT);
  can(EPermission.REVIEW, EResource.DRAFT);
  can(EPermission.APPROVE, EResource.DRAFT);
});
const WRITE_ONLY_DRAFT_ABILITY = buildAbility(({ can }) => {
  can(EPermission.CREATE, EResource.DRAFT);
  can(EPermission.READ, EResource.DRAFT);
});

const PUBLISHER_DRAFT_ABILITY = buildAbility(({ can }) => {
  can(EPermission.CREATE, EResource.DRAFT);
  can(EPermission.READ, EResource.DRAFT);
  can(EPermission.REVIEW, EResource.DRAFT);
  can(EPermission.APPROVE, EResource.DRAFT);
  can(EPermission.PUBLISH, EResource.DRAFT);
});
const READ_ONLY_DRAFT_ABILITY = buildAbility(({ can }) => can(EPermission.READ, EResource.DRAFT));

const notAuthorDraftAbility = (actorId: string): TAppAbility =>
  buildAbility(({ can }) => {
    can(EPermission.REVIEW, EResource.DRAFT);
    can(EPermission.APPROVE, EResource.DRAFT, { createdBy: { $ne: actorId } });
  });

describe("canTransitionDraft", () => {
  it.each(STATUS_PAIRS)("$from → $to is allowed: $isAllowed", ({ from, to, isAllowed }) => {
    expect(canTransitionDraft(from, to)).toBe(isAllowed);
  });
});

describe("assertDraftTransition", () => {
  it("refuses a move the table does not list with 409", () => {
    expect(() =>
      assertDraftTransition(EMentorshipDraftStatus.REJECTED, EMentorshipDraftStatus.IN_REVIEW),
    ).toThrow(ConflictException);
  });
});

describe("resolveAllowedDraftActions", () => {
  const resolveFor = (
    actorId: string,
    ability: TAppAbility,
    status: EMentorshipDraftStatus,
    itemCount = 1,
  ) => resolveAllowedDraftActions({ status, authorId: "sensei", itemCount, actorId, ability });

  it.each([
    [
      EMentorshipDraftStatus.DRAFT,
      [EMentorshipDraftAction.EDIT, EMentorshipDraftAction.SUBMIT, EMentorshipDraftAction.CANCEL],
    ],
    [EMentorshipDraftStatus.IN_REVIEW, [EMentorshipDraftAction.CANCEL]],
    [EMentorshipDraftStatus.APPROVED, [EMentorshipDraftAction.CANCEL]],
    [EMentorshipDraftStatus.REJECTED, []],
    [EMentorshipDraftStatus.PUBLISHED, []],
    [EMentorshipDraftStatus.CANCELLED, []],
  ])("gives the author of a %s draft %j", (status, expected) => {
    expect(resolveFor("sensei", SENSEI_DRAFT_ABILITY, status)).toEqual(expected);
  });

  it.each([
    [EMentorshipDraftStatus.DRAFT, []],
    [
      EMentorshipDraftStatus.IN_REVIEW,
      [EMentorshipDraftAction.APPROVE, EMentorshipDraftAction.REJECT],
    ],
    [EMentorshipDraftStatus.APPROVED, []],
    [EMentorshipDraftStatus.REJECTED, []],
    [EMentorshipDraftStatus.PUBLISHED, []],
    [EMentorshipDraftStatus.CANCELLED, []],
  ])("gives another Sensei on a %s draft %j", (status, expected) => {
    expect(resolveFor("other-sensei", SENSEI_DRAFT_ABILITY, status)).toEqual(expected);
  });

  it("does not offer submit for a draft with no changes", () => {
    expect(resolveFor("sensei", SENSEI_DRAFT_ABILITY, EMentorshipDraftStatus.DRAFT, 0)).toEqual([
      EMentorshipDraftAction.EDIT,
      EMentorshipDraftAction.CANCEL,
    ]);
  });

  it("does not offer approve or reject without those permissions", () => {
    expect(
      resolveFor("other-sensei", WRITE_ONLY_DRAFT_ABILITY, EMentorshipDraftStatus.IN_REVIEW),
    ).toEqual([]);
  });

  it.each([
    [
      EMentorshipDraftStatus.IN_REVIEW,
      [EMentorshipDraftAction.APPROVE, EMentorshipDraftAction.REJECT],
    ],
    [
      EMentorshipDraftStatus.APPROVED,
      [EMentorshipDraftAction.PUBLISH, EMentorshipDraftAction.CANCEL],
    ],
    [EMentorshipDraftStatus.PUBLISHED, []],
    [EMentorshipDraftStatus.CANCELLED, []],
  ])("gives a publisher on someone else's %s draft %j", (status, expected) => {
    expect(resolveFor("other-sensei", PUBLISHER_DRAFT_ABILITY, status)).toEqual(expected);
  });

  it("does not offer cancel to an author who can no longer write drafts", () => {
    expect(resolveFor("sensei", READ_ONLY_DRAFT_ABILITY, EMentorshipDraftStatus.IN_REVIEW)).toEqual(
      [],
    );
  });
});

describe("assertCanCancelDraft", () => {
  const cancelCheck = (actorId: string, ability: TAppAbility, status: EMentorshipDraftStatus) => ({
    status,
    authorId: "sensei",
    actorId,
    ability,
  });

  it("refuses another Sensei with 403", () => {
    expect(() =>
      assertCanCancelDraft(
        cancelCheck("other-sensei", SENSEI_DRAFT_ABILITY, EMentorshipDraftStatus.APPROVED),
      ),
    ).toThrow(ForbiddenException);
  });

  it("refuses a publisher with 409 until someone else's draft is approved", () => {
    expect(() =>
      assertCanCancelDraft(
        cancelCheck("other-sensei", PUBLISHER_DRAFT_ABILITY, EMentorshipDraftStatus.IN_REVIEW),
      ),
    ).toThrow(ConflictException);
  });

  it("refuses the author with 409 once the draft is closed", () => {
    expect(() =>
      assertCanCancelDraft(
        cancelCheck("sensei", SENSEI_DRAFT_ABILITY, EMentorshipDraftStatus.REJECTED),
      ),
    ).toThrow(ConflictException);
  });

  it("lets a publisher cancel someone else's approved draft", () => {
    expect(() =>
      assertCanCancelDraft(
        cancelCheck("other-sensei", PUBLISHER_DRAFT_ABILITY, EMentorshipDraftStatus.APPROVED),
      ),
    ).not.toThrow();
  });
});

describe("canDecideDraft", () => {
  it("lets the not_author condition refuse approval on its own", () => {
    expect(
      canDecideDraft({
        permission: EPermission.APPROVE,
        authorId: "sensei",
        actorId: "other-sensei",
        ability: notAuthorDraftAbility("sensei"),
      }),
    ).toBe(false);
  });
});

describe("toDecisionComment", () => {
  it.each([
    ["   ", null],
    ["  Looks right  ", "Looks right"],
  ])("turns %j into %j", (comment, expected) => {
    expect(toDecisionComment(comment)).toBe(expected);
  });
});

const snapshot = (
  id: string,
  supervisorId: string,
  draftIds: Partial<Pick<IMentorshipSnapshot, "startedByDraftId" | "endedByDraftId">> = {},
): IMentorshipSnapshot => ({
  id,
  supervisorId,
  startedByDraftId: draftIds.startedByDraftId ?? null,
  endedByDraftId: draftIds.endedByDraftId ?? null,
});

const expectation = (expectedMentorship: IMentorshipSnapshot | null): IDraftItemExpectation => ({
  subordinateId: "mentee",
  expectedMentorship,
});

const liveFor = (mentorship?: IMentorshipSnapshot): Map<string, IMentorshipSnapshot> =>
  new Map(mentorship ? [["mentee", mentorship]] : []);

describe("findStaleDraftItems", () => {
  it.each([
    ["the expected mentorship is still live", snapshot("m1", "mentor"), snapshot("m1", "mentor")],
    ["an assign's subordinate is still unassigned", null, undefined],
  ])("finds nothing when %s", (_, expected, live) => {
    expect(findStaleDraftItems([expectation(expected)], liveFor(live))).toEqual([]);
  });

  it("names the supervisors and the draft that moved the subordinate", () => {
    const expected = snapshot("m1", "mentor", { endedByDraftId: "draft-2" });
    const live = snapshot("m2", "other-mentor", { startedByDraftId: "draft-2" });

    expect(findStaleDraftItems([expectation(expected)], liveFor(live))).toEqual([
      {
        subordinateId: "mentee",
        expectedSupervisorId: "mentor",
        currentSupervisorId: "other-mentor",
        changedByDraftId: "draft-2",
      },
    ]);
  });

  it("names the draft that ended the mentorship when nobody replaced it", () => {
    const expected = snapshot("m1", "mentor", { endedByDraftId: "draft-2" });

    expect(findStaleDraftItems([expectation(expected)], liveFor())).toEqual([
      {
        subordinateId: "mentee",
        expectedSupervisorId: "mentor",
        currentSupervisorId: null,
        changedByDraftId: "draft-2",
      },
    ]);
  });

  it("flags an assign whose subordinate has been given a supervisor since", () => {
    const live = snapshot("m2", "other-mentor", { startedByDraftId: "draft-2" });

    expect(findStaleDraftItems([expectation(null)], liveFor(live))).toEqual([
      {
        subordinateId: "mentee",
        expectedSupervisorId: null,
        currentSupervisorId: "other-mentor",
        changedByDraftId: "draft-2",
      },
    ]);
  });
});

describe("buildDraftApplyPlan", () => {
  it("ends the live mentorship of everyone moved and starts each proposed one", () => {
    const participantsById = new Map([
      ...PARTICIPANTS_BY_ID,
      ["free-mentee", participant("free-mentee", EUserRole.MENTEE)],
      ["leaving-mentee", participant("leaving-mentee", EUserRole.MENTEE)],
    ]);
    const liveMentorshipBySubordinate = new Map([
      ["mentee", snapshot("m1", "mentor")],
      ["leaving-mentee", snapshot("m2", "other-mentor")],
      ["mentor", snapshot("m3", "sensei")],
    ]);
    const items: IDraftItemInput[] = [
      assign("free-mentee", "mentor"),
      reassign("mentee", "other-mentor"),
      {
        operation: EMentorshipDraftOperation.UNASSIGN,
        subordinateId: "leaving-mentee",
        proposedSupervisorId: null,
      },
      reassign("mentor", "other-sensei"),
    ];

    expect(buildDraftApplyPlan(items, liveMentorshipBySubordinate, participantsById)).toEqual({
      endedMentorships: [
        snapshot("m1", "mentor"),
        snapshot("m2", "other-mentor"),
        snapshot("m3", "sensei"),
      ],
      startedMentorships: [
        {
          supervisorId: "mentor",
          subordinateId: "free-mentee",
          relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
        },
        {
          supervisorId: "other-mentor",
          subordinateId: "mentee",
          relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
        },
        {
          supervisorId: "other-sensei",
          subordinateId: "mentor",
          relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
        },
      ],
    });
  });
});
