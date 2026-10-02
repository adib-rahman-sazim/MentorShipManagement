import { Injectable, NotFoundException } from "@nestjs/common";

import dayjs from "dayjs";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MentorshipDraftItemsRepository } from "../mentorship-draft-items.repository";
import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "../mentorship-drafts.constants";
import {
  assertDraftHasItems,
  assertDraftTransition,
  assertIsDraftAuthor,
  toStoredDraftItemInput,
} from "../mentorship-drafts.helpers";
import type { IMentorshipDraftByIdContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class SubmitMentorshipDraftInteractor
  implements IBaseInteractor<IMentorshipDraftByIdContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IMentorshipDraftByIdContext): Promise<MentorshipDraftDetailResponse> {
    const { draftId, actorId, ability } = context;

    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const draft = await this.mentorshipDraftsRepository.findByIdForUpdate(draftId, em);

      if (!draft) {
        throw new NotFoundException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_FOUND);
      }

      assertIsDraftAuthor(draft.createdBy.id, actorId);
      assertDraftTransition(draft.status, EMentorshipDraftStatus.IN_REVIEW);

      const items = await this.mentorshipDraftItemsRepository.findByDraftId(draft.id, em);
      assertDraftHasItems(items.length);

      await this.mentorshipDraftItemsService.validateDraftItems(
        { items: items.map(toStoredDraftItemInput), ability },
        em,
      );

      draft.status = EMentorshipDraftStatus.IN_REVIEW;
      draft.submittedAt = dayjs().toDate();
      await em.flush();

      return this.mentorshipDraftsService.findVisibleDetail(context, em);
    });

    return this.mentorshipDraftsSerializer.serializeDetail(view);
  }
}
