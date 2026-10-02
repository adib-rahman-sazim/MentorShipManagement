import { ForbiddenException } from "@nestjs/common";

import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { describe, expect, it } from "vitest";

import {
  EMentorshipDraftOperation,
  EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import type { IMentorshipParticipant } from "@/modules/mentorships/mentorships.interfaces";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";

import {
  assertCanAssignDraftItems,
  findDraftItemViolations,
  findOperationStateViolations,
} from "../mentorship-drafts.helpers";
import type { IDraftItemInput } from "../mentorship-drafts.interfaces";

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
