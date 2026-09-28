import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import {
  EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "../mentorships.constants";
import {
  buildSupervisorBySubordinate,
  findAssignmentViolations,
  isInactiveParticipant,
  isSelfMentorship,
  resolveRelationshipType,
  wouldCreateCycle,
} from "../mentorships.helpers";
import type { IMentorshipParticipant } from "../mentorships.interfaces";

const USER_A_ID = "user-a";
const USER_B_ID = "user-b";
const USER_C_ID = "user-c";
const SHORT_MAX_DEPTH = 2;

const ROLE_PAIR_CASES: Array<[EUserRole, EUserRole, EMentorshipRelationshipType | null]> = [
  [EUserRole.SUPERADMIN, EUserRole.SUPERADMIN, null],
  [EUserRole.SUPERADMIN, EUserRole.SENSEI, null],
  [EUserRole.SUPERADMIN, EUserRole.MENTOR, null],
  [EUserRole.SUPERADMIN, EUserRole.MENTEE, null],
  [EUserRole.SENSEI, EUserRole.SUPERADMIN, null],
  [EUserRole.SENSEI, EUserRole.SENSEI, null],
  [EUserRole.SENSEI, EUserRole.MENTOR, EMentorshipRelationshipType.SENSEI_MENTOR],
  [EUserRole.SENSEI, EUserRole.MENTEE, null],
  [EUserRole.MENTOR, EUserRole.SUPERADMIN, null],
  [EUserRole.MENTOR, EUserRole.SENSEI, null],
  [EUserRole.MENTOR, EUserRole.MENTOR, null],
  [EUserRole.MENTOR, EUserRole.MENTEE, EMentorshipRelationshipType.MENTOR_MENTEE],
  [EUserRole.MENTEE, EUserRole.SUPERADMIN, null],
  [EUserRole.MENTEE, EUserRole.SENSEI, null],
  [EUserRole.MENTEE, EUserRole.MENTOR, null],
  [EUserRole.MENTEE, EUserRole.MENTEE, null],
];

function participant(
  id: string,
  role: EUserRole,
  overrides: Partial<IMentorshipParticipant> = {},
): IMentorshipParticipant {
  return { id, role, state: EUserState.ACTIVE, deletedAt: null, ...overrides };
}

describe("isSelfMentorship", () => {
  it("flags a user supervising themselves", () => {
    expect(isSelfMentorship(USER_A_ID, USER_A_ID)).toBe(true);
  });

  it("allows two different users", () => {
    expect(isSelfMentorship(USER_A_ID, USER_B_ID)).toBe(false);
  });
});

describe("resolveRelationshipType", () => {
  it.each(
    ROLE_PAIR_CASES,
  )("%s supervising %s resolves to %s", (supervisorRole, subordinateRole, expected) => {
    expect(resolveRelationshipType(supervisorRole, subordinateRole)).toBe(expected);
  });
});

describe("wouldCreateCycle", () => {
  it("allows an edge that creates no loop", () => {
    const supervisorBySubordinate = buildSupervisorBySubordinate([
      { supervisorId: USER_A_ID, subordinateId: USER_B_ID },
    ]);

    expect(
      wouldCreateCycle(supervisorBySubordinate, USER_C_ID, USER_B_ID, MENTORSHIP_SUBTREE_MAX_DEPTH),
    ).toBe(false);
  });

  it("detects a direct loop", () => {
    const supervisorBySubordinate = buildSupervisorBySubordinate([
      { supervisorId: USER_A_ID, subordinateId: USER_B_ID },
    ]);

    expect(
      wouldCreateCycle(supervisorBySubordinate, USER_A_ID, USER_B_ID, MENTORSHIP_SUBTREE_MAX_DEPTH),
    ).toBe(true);
  });

  it("detects an indirect loop through three people", () => {
    const supervisorBySubordinate = buildSupervisorBySubordinate([
      { supervisorId: USER_A_ID, subordinateId: USER_B_ID },
      { supervisorId: USER_B_ID, subordinateId: USER_C_ID },
    ]);

    expect(
      wouldCreateCycle(supervisorBySubordinate, USER_A_ID, USER_C_ID, MENTORSHIP_SUBTREE_MAX_DEPTH),
    ).toBe(true);
  });

  it("detects a loop formed only by two items in the same batch", () => {
    const firstItem = { supervisorId: USER_A_ID, subordinateId: USER_B_ID };

    expect(
      wouldCreateCycle(
        buildSupervisorBySubordinate([firstItem]),
        USER_A_ID,
        USER_B_ID,
        MENTORSHIP_SUBTREE_MAX_DEPTH,
      ),
    ).toBe(true);
  });

  it("terminates and fails closed on a pre-existing cycle", () => {
    const supervisorBySubordinate = buildSupervisorBySubordinate([
      { supervisorId: USER_B_ID, subordinateId: USER_A_ID },
      { supervisorId: USER_A_ID, subordinateId: USER_B_ID },
    ]);

    expect(
      wouldCreateCycle(supervisorBySubordinate, USER_C_ID, USER_A_ID, MENTORSHIP_SUBTREE_MAX_DEPTH),
    ).toBe(true);
  });

  it("fails closed on a chain longer than maxDepth", () => {
    const supervisorBySubordinate = buildSupervisorBySubordinate([
      { supervisorId: "level-1", subordinateId: "level-0" },
      { supervisorId: "level-2", subordinateId: "level-1" },
      { supervisorId: "level-3", subordinateId: "level-2" },
    ]);

    expect(wouldCreateCycle(supervisorBySubordinate, USER_A_ID, "level-0", SHORT_MAX_DEPTH)).toBe(
      true,
    );
  });
});

describe("isInactiveParticipant", () => {
  it("accepts an active, non-deleted user", () => {
    expect(isInactiveParticipant(participant(USER_A_ID, EUserRole.MENTOR))).toBe(false);
  });

  it("flags a deactivated user", () => {
    expect(
      isInactiveParticipant(
        participant(USER_A_ID, EUserRole.MENTOR, { state: EUserState.INACTIVE }),
      ),
    ).toBe(true);
  });

  it("flags a soft-deleted user", () => {
    expect(
      isInactiveParticipant(
        participant(USER_A_ID, EUserRole.MENTOR, { deletedAt: dayjs().toDate() }),
      ),
    ).toBe(true);
  });
});

describe("findAssignmentViolations", () => {
  it("returns no violations for a legal edge", () => {
    expect(
      findAssignmentViolations({
        supervisor: participant(USER_A_ID, EUserRole.MENTOR),
        subordinate: participant(USER_B_ID, EUserRole.MENTEE),
        supervisorBySubordinate: new Map(),
      }),
    ).toEqual([]);
  });

  it("reports every violation that applies, without a cycle for a self edge", () => {
    expect(
      findAssignmentViolations({
        supervisor: participant(USER_A_ID, EUserRole.MENTEE, { state: EUserState.INACTIVE }),
        subordinate: participant(USER_A_ID, EUserRole.MENTEE, { state: EUserState.INACTIVE }),
        supervisorBySubordinate: new Map(),
      }),
    ).toEqual([
      EMentorshipViolation.SELF_MENTORSHIP,
      EMentorshipViolation.ILLEGAL_ROLE_PAIR,
      EMentorshipViolation.INACTIVE_USER,
    ]);
  });
});
