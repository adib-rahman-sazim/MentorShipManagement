import type { EntityManager } from "@mikro-orm/postgresql";

import type { Mentorship } from "@/common/entities/mentorships.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { MENTORSHIP_ANCESTORS_SQL, MENTORSHIP_DESCENDANTS_SQL } from "./mentorships.constants";

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
}
