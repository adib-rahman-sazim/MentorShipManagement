import { Injectable } from "@nestjs/common";

import type { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";

import type {
  IMentorshipChainLink,
  IMentorshipTeamTreeNode,
  IMyMentorshipView,
} from "./mentorships.interfaces";
import type {
  MentorshipChainLinkResponse,
  MentorshipPersonResponse,
  MentorshipTeamNodeResponse,
  MyMentorshipResponse,
} from "./mentorships.responses";

@Injectable()
export class MentorshipsSerializer {
  serializeMyMentorship({ chain, team }: IMyMentorshipView): MyMentorshipResponse {
    return {
      supervisors: chain.map((link) => this.serializeChainLink(link)),
      team: team.map((node) => this.serializeTeamNode(node)),
    };
  }

  private serializeChainLink({
    mentorship,
    depth,
  }: IMentorshipChainLink): MentorshipChainLinkResponse {
    return {
      mentorshipId: mentorship.id,
      depth,
      relationshipType: mentorship.relationshipType,
      startedAt: mentorship.startedAt,
      supervisor: this.serializePerson(mentorship.supervisor),
    };
  }

  private serializeTeamNode({
    mentorship,
    team,
  }: IMentorshipTeamTreeNode<Mentorship>): MentorshipTeamNodeResponse {
    return {
      mentorshipId: mentorship.id,
      relationshipType: mentorship.relationshipType,
      startedAt: mentorship.startedAt,
      user: this.serializePerson(mentorship.subordinate),
      team: team.map((node) => this.serializeTeamNode(node)),
    };
  }

  private serializePerson(user: User): MentorshipPersonResponse {
    return { id: user.id, name: user.name, role: user.role.code };
  }
}