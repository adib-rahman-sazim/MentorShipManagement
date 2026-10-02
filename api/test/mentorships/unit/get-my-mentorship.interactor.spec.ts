import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { Role } from "@/common/entities/roles.entity";
import { User } from "@/common/entities/users.entity";
import { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import { EUserRole } from "@/common/enums/roles.enums";
import { GetMyMentorshipInteractor } from "@/modules/mentorships/interactors/get-my-mentorship.interactor";
import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "@/modules/mentorships/mentorships.constants";
import type { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { MentorshipsSerializer } from "@/modules/mentorships/mentorships.serializer";

const STARTED_AT = dayjs("2026-09-01T00:00:00.000Z").toDate();

const makeUser = (id: string, role: EUserRole): User =>
  Object.assign(new User(), { id, name: id, role: Object.assign(new Role(), { code: role }) });

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

describe("GetMyMentorshipInteractor", () => {
  it("returns the user's supervisors and team from both walks", async () => {
    const sensei = makeUser("sensei", EUserRole.SENSEI);
    const mentor = makeUser("mentor", EUserRole.MENTOR);
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
    mentorshipsRepository.findChain.mockResolvedValue([{ mentorship: senseiToMentor, depth: 1 }]);
    mentorshipsRepository.findTeam.mockResolvedValue([mentorToMentee]);
    const interactor = new GetMyMentorshipInteractor(
      mentorshipsRepository,
      new MentorshipsSerializer(),
    );

    const result = await interactor.execute(mentor.id);

    expect(mentorshipsRepository.findChain).toHaveBeenCalledWith(
      mentor.id,
      MENTORSHIP_SUBTREE_MAX_DEPTH,
    );
    expect(mentorshipsRepository.findTeam).toHaveBeenCalledWith(
      mentor.id,
      MENTORSHIP_SUBTREE_MAX_DEPTH,
    );
    expect(result).toEqual({
      supervisors: [
        {
          mentorshipId: senseiToMentor.id,
          depth: 1,
          relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
          startedAt: STARTED_AT,
          supervisor: { id: sensei.id, name: sensei.name, role: EUserRole.SENSEI },
        },
      ],
      team: [
        {
          mentorshipId: mentorToMentee.id,
          relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
          startedAt: STARTED_AT,
          user: { id: mentee.id, name: mentee.name, role: EUserRole.MENTEE },
          team: [],
        },
      ],
    });
  });
});
