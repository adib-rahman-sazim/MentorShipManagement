import { LockMode, type RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { NOT_SOFT_DELETED_DRAFT } from "./mentorship-drafts.constants";

export class MentorshipDraftsRepository extends CustomSQLBaseRepository<MentorshipDraft> {
  createDraft(data: RequiredEntityData<MentorshipDraft>, em?: EntityManager): MentorshipDraft {
    const scopedEntityManager = this.getScopedEntityManager(em);
    const draft = scopedEntityManager.create(MentorshipDraft, data);
    scopedEntityManager.persist(draft);

    return draft;
  }

  findByIdForUpdate(id: string, em?: EntityManager): Promise<MentorshipDraft | null> {
    return this.getScopedRepository(em).findOne(
      { id, ...NOT_SOFT_DELETED_DRAFT },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }
}
