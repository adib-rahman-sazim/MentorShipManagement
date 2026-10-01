import { Injectable } from "@nestjs/common";

import type { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";

import type {
  IMentorshipChainLink,
  IMentorshipGraphView,
  IMentorshipTeamTreeNode,
  IMyMentorshipView,
} from "./mentorships.interfaces";
import type {
  MentorshipChainLinkResponse,
  MentorshipGraphEdgeResponse,
  MentorshipGraphNodeResponse,
  MentorshipGraphResponse,
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

  serializeGraph({ users, mentorships }: IMentorshipGraphView): MentorshipGraphResponse {
    return {
      nodes: users.map((user) => this.serializeGraphNode(user)),
      edges: mentorships.map((mentorship) => this.serializeGraphEdge(mentorship)),
    };
  }

  private serializeGraphNode(user: User): MentorshipGraphNodeResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.code,
      state: user.state,
    };
  }

  private serializeGraphEdge(mentorship: Mentorship): MentorshipGraphEdgeResponse {
    return {
      id: mentorship.id,
      supervisorId: mentorship.supervisor.id,
      subordinateId: mentorship.subordinate.id,
      relationshipType: mentorship.relationshipType,
      startedAt: mentorship.startedAt,
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
