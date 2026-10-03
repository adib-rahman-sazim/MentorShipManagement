import { LockMode, type RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager, ObjectQuery } from "@mikro-orm/postgresql";

import { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

import { DRAFT_ACTOR_POPULATE, NOT_SOFT_DELETED_DRAFT } from "./mentorship-drafts.constants";
import type { IFindVisibleDraftsOptions } from "./mentorship-drafts.interfaces";

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

  findVisibleById(
    id: string,
    visibility: ObjectQuery<MentorshipDraft>,
    em?: EntityManager,
  ): Promise<MentorshipDraft | null> {
    return this.getScopedRepository(em).findOne(
      { id, ...NOT_SOFT_DELETED_DRAFT, ...visibility },
      { populate: DRAFT_ACTOR_POPULATE },
    );
  }

  async findVisiblePaginated(
    { visibility, page, limit, status, createdById }: IFindVisibleDraftsOptions,
    em?: EntityManager,
  ): Promise<{ drafts: MentorshipDraft[]; total: number }> {
    const where: ObjectQuery<MentorshipDraft> = { ...NOT_SOFT_DELETED_DRAFT, ...visibility };

    if (status) {
      where.status = status;
    }

    if (createdById) {
      where.createdBy = createdById;
    }

    const [drafts, total] = await this.getScopedRepository(em).findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { createdAt: "DESC", id: "DESC" },
      populate: ["createdBy.role"],
    });

    return { drafts, total };
  }
}
