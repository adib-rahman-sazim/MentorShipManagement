import { Injectable, NotFoundException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";

import { MentorshipDraftItemsRepository } from "./mentorship-draft-items.repository";
import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "./mentorship-drafts.constants";
import { buildVisibleDraftsFilter, resolveAllowedDraftActions } from "./mentorship-drafts.helpers";
import type {
  IMentorshipDraftByIdContext,
  IMentorshipDraftDetailView,
} from "./mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "./mentorship-drafts.repository";

@Injectable()
export class MentorshipDraftsService {
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
  ) {}

  async findVisibleForUpdate(
    { draftId, actorId }: IMentorshipDraftByIdContext,
    em: EntityManager,
  ): Promise<MentorshipDraft> {
    const draft = await this.mentorshipDraftsRepository.findVisibleByIdForUpdate(
      draftId,
      buildVisibleDraftsFilter(actorId),
      em,
    );

    if (!draft) {
      throw new NotFoundException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_FOUND);
    }

    return draft;
  }

  async findVisible(
    { draftId, actorId }: IMentorshipDraftByIdContext,
    em?: EntityManager,
  ): Promise<MentorshipDraft> {
    const draft = await this.mentorshipDraftsRepository.findVisibleById(
      draftId,
      buildVisibleDraftsFilter(actorId),
      em,
    );

    if (!draft) {
      throw new NotFoundException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_FOUND);
    }

    return draft;
  }

  async findVisibleDetail(
    context: IMentorshipDraftByIdContext,
    em?: EntityManager,
  ): Promise<IMentorshipDraftDetailView> {
    const { actorId, ability } = context;
    const draft = await this.findVisible(context, em);
    const items = await this.mentorshipDraftItemsRepository.findByDraftIdWithPeople(draft.id, em);

    return {
      draft,
      items,
      allowedActions: resolveAllowedDraftActions({
        status: draft.status,
        authorId: draft.createdBy.id,
        itemCount: items.length,
        actorId,
        ability,
      }),
    };
  }
}
