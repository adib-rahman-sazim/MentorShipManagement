import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MENTORSHIP_SUBTREE_MAX_DEPTH } from "../mentorships.constants";
import { buildTeamTree } from "../mentorships.helpers";
import { MentorshipsRepository } from "../mentorships.repository";
import type { MyMentorshipResponse } from "../mentorships.responses";
import { MentorshipsSerializer } from "../mentorships.serializer";

@Injectable()
export class GetMyMentorshipInteractor implements IBaseInteractor<string, MyMentorshipResponse> {
  constructor(
    private readonly mentorshipsRepository: MentorshipsRepository,
    private readonly mentorshipsSerializer: MentorshipsSerializer,
  ) {}

  async execute(userId: string): Promise<MyMentorshipResponse> {
    const chain = await this.mentorshipsRepository.findChain(userId, MENTORSHIP_SUBTREE_MAX_DEPTH);
    const teamMentorships = await this.mentorshipsRepository.findTeam(
      userId,
      MENTORSHIP_SUBTREE_MAX_DEPTH,
    );

    return this.mentorshipsSerializer.serializeMyMentorship({
      chain,
      team: buildTeamTree(userId, teamMentorships),
    });
  }
}
