import { Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { buildSupervisorBySubordinate } from "@/modules/mentorships/mentorships.helpers";
import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { UsersRepository } from "@/modules/users/users.repository";

import {
  assertCanAssignDraftItems,
  assertNoDraftItemViolations,
  collectDraftItemUserIds,
  findDraftItemViolations,
  toMentorshipParticipant,
} from "./mentorship-drafts.helpers";
import type {
  IValidateDraftItemsContext,
  IValidatedDraftItem,
} from "./mentorship-drafts.interfaces";

@Injectable()
export class MentorshipDraftItemsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mentorshipsRepository: MentorshipsRepository,
  ) {}

  async validateDraftItems(
    { items, ability }: IValidateDraftItemsContext,
    em?: EntityManager,
  ): Promise<IValidatedDraftItem[]> {
    if (items.length === 0) {
      return [];
    }

    const users = await this.usersRepository.findByIds(collectDraftItemUserIds(items), em);
    const participantsById = new Map(users.map((user) => [user.id, toMentorshipParticipant(user)]));

    assertCanAssignDraftItems(items, participantsById, ability);

    const activeMentorships = await this.mentorshipsRepository.findActiveEdges(em);
    const activeMentorshipIdBySubordinate = new Map(
      activeMentorships.map((mentorship) => [mentorship.subordinate.id, mentorship.id]),
    );
    const supervisorBySubordinate = buildSupervisorBySubordinate(
      activeMentorships.map((mentorship) => ({
        supervisorId: mentorship.supervisor.id,
        subordinateId: mentorship.subordinate.id,
      })),
    );

    assertNoDraftItemViolations(
      findDraftItemViolations({ items, participantsById, supervisorBySubordinate }),
    );

    return items.map((item) => ({
      ...item,
      expectedCurrentMentorshipId: activeMentorshipIdBySubordinate.get(item.subordinateId) ?? null,
    }));
  }
}
