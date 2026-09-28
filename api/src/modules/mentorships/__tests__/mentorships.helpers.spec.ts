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
  buildTeamTree,
  findAssignmentViolations,
  isInactiveParticipant,
  isSelfMentorship,
  resolveRelationshipType,
  wouldCreateCycle,
} from "../mentorships.helpers";
import type { IMentorshipParticipant, IMentorshipTeamMember } from "../mentorships.interfaces";

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

describe("buildTeamTree", () => {
  const SENSEI_ID = "sensei";
  const MENTOR_A_ID = "mentor-a";
  const MENTOR_B_ID = "mentor-b";
  const MENTEE_A1_ID = "mentee-a1";
  const MENTEE_A2_ID = "mentee-a2";
  const MENTEE_B1_ID = "mentee-b1";
  const OUTSIDER_ID = "outsider";
  const OUTSIDER_MENTEE_ID = "outsider-mentee";

  const teamRow = (
    supervisorId: string,
    subordinateId: string,
    subordinateName: string,
  ): IMentorshipTeamMember => ({
    supervisor: { id: supervisorId },
    subordinate: { id: subordinateId, name: subordinateName },
  });

  const expectedNode = (subordinateId: string, team: unknown[] = []) => ({
    mentorship: expect.objectContaining({
      subordinate: expect.objectContaining({ id: subordinateId }),
    }),
    team,
  });

  const SENSEI_TEAM_ROWS = [
    teamRow(MENTOR_B_ID, MENTEE_B1_ID, "Farah"),
    teamRow(MENTOR_A_ID, MENTEE_A2_ID, "Dina"),
    teamRow(SENSEI_ID, MENTOR_B_ID, "Bilal"),
    teamRow(MENTOR_A_ID, MENTEE_A1_ID, "Chen"),
    teamRow(SENSEI_ID, MENTOR_A_ID, "Aisha"),
  ];

  const SENSEI_TEAM_TREE = [
    expectedNode(MENTOR_A_ID, [expectedNode(MENTEE_A1_ID), expectedNode(MENTEE_A2_ID)]),
    expectedNode(MENTOR_B_ID, [expectedNode(MENTEE_B1_ID)]),
  ];

  it("returns an empty team for no rows", () => {
    expect(buildTeamTree(SENSEI_ID, [])).toEqual([]);
  });

  it("nests each mentor's mentees under that mentor, sorted by name", () => {
    expect(buildTeamTree(SENSEI_ID, SENSEI_TEAM_ROWS)).toEqual(SENSEI_TEAM_TREE);
  });

  it("starts from the given root, not the top of the rows", () => {
    expect(buildTeamTree(MENTOR_A_ID, SENSEI_TEAM_ROWS)).toEqual([
      expectedNode(MENTEE_A1_ID),
      expectedNode(MENTEE_A2_ID),
    ]);
  });

  it("breaks a name tie by id so the order is stable", () => {
    const rows = [
      teamRow(MENTOR_A_ID, "mentee-z", "Same Name"),
      teamRow(MENTOR_A_ID, "mentee-b", "Zed"),
      teamRow(MENTOR_A_ID, "mentee-a", "Same Name"),
    ];

    expect(buildTeamTree(MENTOR_A_ID, rows)).toEqual([
      expectedNode("mentee-a"),
      expectedNode("mentee-z"),
      expectedNode("mentee-b"),
    ]);
  });

  it("drops rows that are not connected to the root", () => {
    const rows = [...SENSEI_TEAM_ROWS, teamRow(OUTSIDER_ID, OUTSIDER_MENTEE_ID, "Gita")];

    expect(buildTeamTree(SENSEI_ID, rows)).toEqual(SENSEI_TEAM_TREE);
  });

  it("terminates on cyclic rows and never lists the root under itself", () => {
    const rows = [...SENSEI_TEAM_ROWS, teamRow(MENTEE_B1_ID, SENSEI_ID, "Sensei")];

    expect(buildTeamTree(SENSEI_ID, rows)).toEqual(SENSEI_TEAM_TREE);
  });

  it("lists a person once even if two rows point at them", () => {
    const rows = [...SENSEI_TEAM_ROWS, teamRow(MENTOR_B_ID, MENTEE_A1_ID, "Chen")];

    expect(buildTeamTree(SENSEI_ID, rows)).toEqual(SENSEI_TEAM_TREE);
  });
});
