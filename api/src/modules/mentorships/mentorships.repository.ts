import { LockMode } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import dayjs from "dayjs";

import { Mentorship } from "@/common/entities/mentorships.entity";
import { EMentorshipStatus } from "@/common/enums/mentorships.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import {
  ACTIVE_MENTORSHIP,
  MENTORSHIP_ANCESTORS_SQL,
  MENTORSHIP_DESCENDANTS_SQL,
} from "./mentorships.constants";
import type { IMentorshipChainLink, IMentorshipStart } from "./mentorships.interfaces";

export class MentorshipsRepository extends CustomSQLBaseRepository<Mentorship> {
  async findDescendantUserIds(
    userId: string,
    maxDepth: number,
    em?: EntityManager,
  ): Promise<string[]> {
    const rows = await this.getScopedEntityManager(em)
      .getConnection()
      .execute<Array<{ user_id: string }>>(MENTORSHIP_DESCENDANTS_SQL, [userId, maxDepth]);

    return rows.map((row) => row.user_id);
  }

  async findAncestorUserIds(
    userId: string,
    maxDepth: number,
    em?: EntityManager,
  ): Promise<string[]> {
    const rows = await this.getScopedEntityManager(em)
      .getConnection()
      .execute<Array<{ user_id: string }>>(MENTORSHIP_ANCESTORS_SQL, [userId, maxDepth]);

    return rows.map((row) => row.user_id);
  }

  async findChain(
    userId: string,
    maxDepth: number,
    em?: EntityManager,
  ): Promise<IMentorshipChainLink[]> {
    const repository = this.getScopedRepository(em);
    const chain: IMentorshipChainLink[] = [];
    const visitedUserIds = new Set([userId]);
    let subordinateId = userId;

    while (chain.length < maxDepth) {
      const mentorship = await repository.findOne(
        { subordinate: subordinateId, ...ACTIVE_MENTORSHIP },
        { populate: ["supervisor.role"] },
      );

      if (!mentorship || visitedUserIds.has(mentorship.supervisor.id)) {
        break;
      }

      visitedUserIds.add(mentorship.supervisor.id);
      chain.push({ mentorship, depth: chain.length + 1 });
      subordinateId = mentorship.supervisor.id;
    }

    return chain;
  }

  async findTeam(userId: string, maxDepth: number, em?: EntityManager): Promise<Mentorship[]> {
    const repository = this.getScopedRepository(em);
    const team: Mentorship[] = [];
    const visitedUserIds = new Set([userId]);
    let supervisorIds = [userId];

    for (let depth = 1; depth <= maxDepth && supervisorIds.length > 0; depth++) {
      const level = await repository.find(
        { supervisor: { $in: supervisorIds }, ...ACTIVE_MENTORSHIP },
        { populate: ["subordinate.role"] },
      );
      const unvisited = level.filter(
        (mentorship) => !visitedUserIds.has(mentorship.subordinate.id),
      );

      for (const mentorship of unvisited) {
        visitedUserIds.add(mentorship.subordinate.id);
      }

      team.push(...unvisited);
      supervisorIds = unvisited.map((mentorship) => mentorship.subordinate.id);
    }

    return team;
  }

  findActiveEdges(em?: EntityManager): Promise<Mentorship[]> {
    return this.getScopedRepository(em).find(ACTIVE_MENTORSHIP, { orderBy: { startedAt: "ASC" } });
  }

  findActiveBySubordinateIds(subordinateIds: string[], em?: EntityManager): Promise<Mentorship[]> {
    return this.getScopedRepository(em).find({
      subordinate: { $in: subordinateIds },
      ...ACTIVE_MENTORSHIP,
    });
  }

  findActiveBySubordinateIdsForUpdate(
    subordinateIds: string[],
    em?: EntityManager,
  ): Promise<Mentorship[]> {
    return this.getScopedRepository(em).find(
      { subordinate: { $in: subordinateIds }, ...ACTIVE_MENTORSHIP },
      { orderBy: { id: "ASC" }, lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }

  async endMentorships(
    mentorshipIds: string[],
    endedByDraftId: string,
    em?: EntityManager,
  ): Promise<void> {
    if (mentorshipIds.length === 0) {
      return;
    }

    const endedAt = dayjs().toDate();

    await this.getScopedEntityManager(em).nativeUpdate(
      Mentorship,
      { id: { $in: mentorshipIds } },
      {
        status: EMentorshipStatus.ENDED,
        endedAt,
        endedByDraft: endedByDraftId,
        updatedAt: endedAt,
      },
    );
  }

  startMentorships(
    starts: readonly IMentorshipStart[],
    startedByDraftId: string,
    em?: EntityManager,
  ): Mentorship[] {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const startedAt = dayjs().toDate();
    const mentorships = starts.map((start) =>
      scopedEntityManager.create(Mentorship, {
        supervisor: start.supervisorId,
        subordinate: start.subordinateId,
        relationshipType: start.relationshipType,
        status: EMentorshipStatus.ACTIVE,
        startedAt,
        startedByDraft: startedByDraftId,
      }),
    );
    scopedEntityManager.persist(mentorships);

    return mentorships;
  }

  async hasActiveMentorship(userId: string, em?: EntityManager): Promise<boolean> {
    const activeCount = await this.getScopedRepository(em).count({
      $or: [{ supervisor: userId }, { subordinate: userId }],
      status: EMentorshipStatus.ACTIVE,
      deletedAt: null,
    });

    return activeCount > 0;
  }
}
