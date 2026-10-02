import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";
import { GetMentorshipGraphInteractor } from "@/modules/mentorships/interactors/get-mentorship-graph.interactor";
import type { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { MentorshipsSerializer } from "@/modules/mentorships/mentorships.serializer";
import type { UsersRepository } from "@/modules/users/users.repository";

const STARTED_AT = dayjs("2026-09-01T00:00:00.000Z").toDate();

const makeUser = (id: string, role: EUserRole, state = EUserState.ACTIVE): User =>
  Object.assign(new User(), {
    id,
    name: id,
    email: `${id}@graph.test`,
    state,
    role: Object.assign(new Role(), { code: role }),
  });

const makeMentorship = (
  id: string,
  supervisor: User,
  subordinate: User,
  relationshipType: EMentorshipRelationshipType,
): Mentorship =>
  Object.assign(new Mentorship(), {
    id,
    supervisor,
    subordinate,
    relationshipType,
    startedAt: STARTED_AT,
  });

describe("GetMentorshipGraphInteractor", () => {
  it("loads the people on the active edges once each and returns nodes and edges", async () => {
    const sensei = makeUser("sensei", EUserRole.SENSEI);
    const mentor = makeUser("mentor", EUserRole.MENTOR, EUserState.INACTIVE);
    const mentee = makeUser("mentee", EUserRole.MENTEE);
    const senseiToMentor = makeMentorship(
      "sensei-to-mentor",
      sensei,
      mentor,
      EMentorshipRelationshipType.SENSEI_MENTOR,
    );
    const mentorToMentee = makeMentorship(
      "mentor-to-mentee",
      mentor,
      mentee,
      EMentorshipRelationshipType.MENTOR_MENTEE,
    );

    const mentorshipsRepository = mockDeep<MentorshipsRepository>();
    const usersRepository = mockDeep<UsersRepository>();
    mentorshipsRepository.findActiveEdges.mockResolvedValue([senseiToMentor, mentorToMentee]);
    usersRepository.findMentorshipGraphMembers.mockResolvedValue([mentee, mentor, sensei]);
    const interactor = new GetMentorshipGraphInteractor(
      mentorshipsRepository,
      usersRepository,
      new MentorshipsSerializer(),
    );

    const result = await interactor.execute();

    expect(usersRepository.findMentorshipGraphMembers).toHaveBeenCalledWith([
      sensei.id,
      mentor.id,
      mentee.id,
    ]);
    expect(result).toEqual({
      nodes: [
        {
          id: mentee.id,
          name: mentee.name,
          email: mentee.email,
          role: EUserRole.MENTEE,
          state: EUserState.ACTIVE,
        },
        {
          id: mentor.id,
          name: mentor.name,
          email: mentor.email,
          role: EUserRole.MENTOR,
          state: EUserState.INACTIVE,
        },
        {
          id: sensei.id,
          name: sensei.name,
          email: sensei.email,
          role: EUserRole.SENSEI,
          state: EUserState.ACTIVE,
        },
      ],
      edges: [
        {
          id: senseiToMentor.id,
          supervisorId: sensei.id,
          subordinateId: mentor.id,
          relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
          startedAt: STARTED_AT,
        },
        {
          id: mentorToMentee.id,
          supervisorId: mentor.id,
          subordinateId: mentee.id,
          relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
          startedAt: STARTED_AT,
        },
      ],
    });
  });
});
