import { Injectable } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import { MentorshipsRepository } from "@/modules/mentorships/mentorships.repository";
import { UsersRepository } from "@/modules/users/users.repository";

import { MentorshipDraftItemsRepository } from "./mentorship-draft-items.repository";
import {
  assertCanAssignDraftItems,
  assertNoDraftItemViolations,
  collectDraftItemUserIds,
  findDraftItemViolations,
  findStaleDraftItems,
  groupDraftsBySubordinate,
  resolveItemRelationshipType,
  toDraftItemExpectation,
  toLiveSupervisorBySubordinate,
  toMentorshipParticipant,
  toMentorshipSnapshot,
  toStoredDraftItemInput,
} from "./mentorship-drafts.helpers";
import type {
  IDraftChangeSummaryItem,
  IStaleDraftItem,
  IValidateDraftItemsContext,
  IValidatedDraftItem,
} from "./mentorship-drafts.interfaces";

@Injectable()
export class MentorshipDraftItemsService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mentorshipsRepository: MentorshipsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
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
    const supervisorBySubordinate = toLiveSupervisorBySubordinate(activeMentorships);

    assertNoDraftItemViolations(
      findDraftItemViolations({ items, participantsById, supervisorBySubordinate }),
    );

    return items.map((item) => ({
      ...item,
      expectedCurrentMentorshipId: activeMentorshipIdBySubordinate.get(item.subordinateId) ?? null,
    }));
  }

  async findStaleItems(draftId: string, em?: EntityManager): Promise<IStaleDraftItem[]> {
    const items = await this.mentorshipDraftItemsRepository.findByDraftIdWithExpectedMentorship(
      draftId,
      em,
    );

    if (items.length === 0) {
      return [];
    }

    const liveMentorships = await this.mentorshipsRepository.findActiveBySubordinateIds(
      items.map((item) => item.subordinate.id),
      em,
    );

    return findStaleDraftItems(
      items.map(toDraftItemExpectation),
      new Map(
        liveMentorships.map((mentorship) => [
          mentorship.subordinate.id,
          toMentorshipSnapshot(mentorship),
        ]),
      ),
    );
  }

  async findChangeSummaryItems(
    draftId: string,
    em?: EntityManager,
  ): Promise<IDraftChangeSummaryItem[]> {
    const items = await this.mentorshipDraftItemsRepository.findByDraftIdForChangeSummary(
      draftId,
      em,
    );

    if (items.length === 0) {
      return [];
    }

    const inputs = items.map(toStoredDraftItemInput);
    const subordinateIds = inputs.map((input) => input.subordinateId);
    const supervisorBySubordinate = toLiveSupervisorBySubordinate(
      await this.mentorshipsRepository.findActiveEdges(em),
    );
    const currentSupervisorIds = subordinateIds.flatMap(
      (subordinateId) => supervisorBySubordinate.get(subordinateId) ?? [],
    );
    const users = await this.usersRepository.findByIds(
      [...new Set([...collectDraftItemUserIds(inputs), ...currentSupervisorIds])],
      em,
    );
    const usersById = new Map(users.map((user) => [user.id, user]));
    const participantsById = new Map(users.map((user) => [user.id, toMentorshipParticipant(user)]));

    const violationsBySubordinate = new Map(
      findDraftItemViolations({ items: inputs, participantsById, supervisorBySubordinate }).map(
        ({ subordinateId, violations }) => [subordinateId, violations],
      ),
    );
    const staleBySubordinate = new Map(
      (await this.findStaleItems(draftId, em)).map((staleItem) => [
        staleItem.subordinateId,
        staleItem,
      ]),
    );
    const overlappingDraftsBySubordinate = groupDraftsBySubordinate(
      await this.mentorshipDraftItemsRepository.findOverlapping(subordinateIds, draftId, em),
    );

    return items.map((item, index) => {
      const input = inputs[index];
      const currentSupervisorId = supervisorBySubordinate.get(input.subordinateId);

      return {
        item,
        currentSupervisor:
          currentSupervisorId === undefined ? null : (usersById.get(currentSupervisorId) ?? null),
        relationshipType: resolveItemRelationshipType(input, participantsById),
        violations: violationsBySubordinate.get(input.subordinateId) ?? [],
        stale: staleBySubordinate.get(input.subordinateId) ?? null,
        overlappingDrafts: overlappingDraftsBySubordinate.get(input.subordinateId) ?? [],
      };
    });
  }
}
