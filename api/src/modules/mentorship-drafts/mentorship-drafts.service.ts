import { Injectable, NotFoundException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/postgresql";

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

  async findVisibleDetail(
    { draftId, actorId, ability }: IMentorshipDraftByIdContext,
    em?: EntityManager,
  ): Promise<IMentorshipDraftDetailView> {
    const draft = await this.mentorshipDraftsRepository.findVisibleById(
      draftId,
      buildVisibleDraftsFilter(actorId),
      em,
    );

    if (!draft) {
      throw new NotFoundException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_FOUND);
    }

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
