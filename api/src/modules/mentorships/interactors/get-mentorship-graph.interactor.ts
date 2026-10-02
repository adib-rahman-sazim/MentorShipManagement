import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { UsersRepository } from "@/modules/users/users.repository";

import { MentorshipsRepository } from "../mentorships.repository";
import type { MentorshipGraphResponse } from "../mentorships.responses";
import { MentorshipsSerializer } from "../mentorships.serializer";

@Injectable()
export class GetMentorshipGraphInteractor
  implements IBaseInteractor<void, MentorshipGraphResponse>
{
  constructor(
    private readonly mentorshipsRepository: MentorshipsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly mentorshipsSerializer: MentorshipsSerializer,
  ) {}

  async execute(): Promise<MentorshipGraphResponse> {
    const mentorships = await this.mentorshipsRepository.findActiveEdges();
    const userIdsOnActiveEdges = mentorships.flatMap((mentorship) => [
      mentorship.supervisor.id,
      mentorship.subordinate.id,
    ]);
    const users = await this.usersRepository.findMentorshipGraphMembers([
      ...new Set(userIdsOnActiveEdges),
    ]);

    return this.mentorshipsSerializer.serializeGraph({ users, mentorships });
  }
}
