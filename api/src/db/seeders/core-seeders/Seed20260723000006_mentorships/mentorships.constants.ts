import { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import { MOCK_USER_EMAILS } from "@/db/seeders/core-seeders/Seed20260723000005_mock_users/mock-users.constants";

import type { TMentorshipFixture } from "./mentorships.types";


export const MENTORSHIP_FIXTURES: TMentorshipFixture[] = [
  {
    supervisorEmail: MOCK_USER_EMAILS.SENSEI,
    subordinateEmail: MOCK_USER_EMAILS.MENTOR,
    relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
  },
  {
    supervisorEmail: MOCK_USER_EMAILS.SENSEI,
    subordinateEmail: MOCK_USER_EMAILS.MENTOR_TWO,
    relationshipType: EMentorshipRelationshipType.SENSEI_MENTOR,
  },
  {
    supervisorEmail: MOCK_USER_EMAILS.MENTOR,
    subordinateEmail: MOCK_USER_EMAILS.MENTEE,
    relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
  },
  {
    supervisorEmail: MOCK_USER_EMAILS.MENTOR,
    subordinateEmail: MOCK_USER_EMAILS.MENTEE_TWO,
    relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
  },
  {
    supervisorEmail: MOCK_USER_EMAILS.MENTOR_TWO,
    subordinateEmail: MOCK_USER_EMAILS.MENTEE_THREE,
    relationshipType: EMentorshipRelationshipType.MENTOR_MENTEE,
  },
];
