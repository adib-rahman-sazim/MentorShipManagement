import { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import type { EMentorshipRelationshipType } from "@/common/enums/mentorships.enums";
import type { EUserRole } from "@/common/enums/roles.enums";
import type { EUserState } from "@/common/enums/users.enums";

export interface IMentorshipParticipant {
  id: string;
  role: EUserRole;
  state: EUserState;
  deletedAt: Date | null;
}

export interface ILegalRolePair {
  supervisorRole: EUserRole;
  subordinateRole: EUserRole;
  relationshipType: EMentorshipRelationshipType;
}

export interface IMentorshipEdge {
  supervisorId: string;
  subordinateId: string;
}

export interface IMentorshipStart {
  supervisorId: string;
  subordinateId: string;
  relationshipType: EMentorshipRelationshipType;
}

export interface IMentorshipAssignmentInput {
  supervisor: IMentorshipParticipant;
  subordinate: IMentorshipParticipant;
  supervisorBySubordinate: ReadonlyMap<string, string>;
}

export interface IMentorshipChainLink {
  mentorship: Mentorship;
  depth: number;
}

export interface IMentorshipTeamMember {
  supervisor: { id: string };
  subordinate: { id: string; name: string };
}

export interface IMentorshipTeamTreeNode<T extends IMentorshipTeamMember> {
  mentorship: T;
  team: IMentorshipTeamTreeNode<T>[];
}

export interface IMyMentorshipView {
  chain: IMentorshipChainLink[];
  team: IMentorshipTeamTreeNode<Mentorship>[];
}

export interface IMentorshipGraphView {
  users: User[];
  mentorships: Mentorship[];
}
