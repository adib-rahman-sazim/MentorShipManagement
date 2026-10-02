import type { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";

export type TMentorshipFixture = {
  supervisorEmail: string;
  subordinateEmail: string;
  relationshipType: EMentorshipRelationshipType;
};
