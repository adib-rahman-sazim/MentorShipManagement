import { raw } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { DRAFT_ITEM_PEOPLE_POPULATE } from "./mentorship-drafts.constants";
import type { IDraftItemCountRow, IValidatedDraftItem } from "./mentorship-drafts.interfaces";

export class MentorshipDraftItemsRepository extends CustomSQLBaseRepository<MentorshipDraftItem> {
  findByDraftId(draftId: string, em?: EntityManager): Promise<MentorshipDraftItem[]> {
    return this.getScopedRepository(em).find(
      { draft: draftId },
      { orderBy: { createdAt: "ASC", id: "ASC" } },
    );
  }

  findByDraftIdWithPeople(draftId: string, em?: EntityManager): Promise<MentorshipDraftItem[]> {
    return this.getScopedRepository(em).find(
      { draft: draftId },
      {
        orderBy: { subordinate: { name: "ASC" }, id: "ASC" },
        populate: DRAFT_ITEM_PEOPLE_POPULATE,
      },
    );
  }

  async countByDraftIds(draftIds: string[], em?: EntityManager): Promise<Map<string, number>> {
    if (draftIds.length === 0) {
      return new Map();
    }

    const rows = await this.getScopedEntityManager(em)
      .createQueryBuilder(MentorshipDraftItem, "item")
      .select([raw('item.draft_id as "draftId"'), raw('count(*)::int as "itemCount"')])
      .where({ draft: { $in: draftIds } })
      .groupBy("item.draft")
      .execute<IDraftItemCountRow[]>("all", false);

    return new Map(rows.map((row) => [row.draftId, row.itemCount]));
  }

  createItems(
    draft: MentorshipDraft,
    items: readonly IValidatedDraftItem[],
    em?: EntityManager,
  ): MentorshipDraftItem[] {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const draftItems = items.map((item) =>
      scopedEntityManager.create(MentorshipDraftItem, {
        draft,
        operation: item.operation,
        subordinate: item.subordinateId,
        proposedSupervisor: item.proposedSupervisorId,
        expectedCurrentMentorship: item.expectedCurrentMentorshipId,
      }),
    );
    scopedEntityManager.persist(draftItems);

    return draftItems;
  }

  deleteByDraftId(draftId: string, em?: EntityManager): Promise<number> {
    return this.getScopedEntityManager(em).nativeDelete(MentorshipDraftItem, { draft: draftId });
  }
}
