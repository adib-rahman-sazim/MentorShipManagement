import type { EntityManager } from "@mikro-orm/postgresql";

import { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import type { IValidatedDraftItem } from "./mentorship-drafts.interfaces";

export class MentorshipDraftItemsRepository extends CustomSQLBaseRepository<MentorshipDraftItem> {
  findByDraftId(draftId: string, em?: EntityManager): Promise<MentorshipDraftItem[]> {
    return this.getScopedRepository(em).find(
      { draft: draftId },
      { orderBy: { createdAt: "ASC", id: "ASC" } },
    );
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
