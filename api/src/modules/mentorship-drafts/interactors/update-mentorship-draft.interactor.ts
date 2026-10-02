import { Injectable, NotFoundException } from "@nestjs/common";

import dayjs from "dayjs";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MentorshipDraftItemsRepository } from "../mentorship-draft-items.repository";
import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "../mentorship-drafts.constants";
import {
  assertDraftIsEditable,
  assertIsDraftAuthor,
  toDraftItemInput,
} from "../mentorship-drafts.helpers";
import type { IUpdateMentorshipDraftContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";

@Injectable()
export class UpdateMentorshipDraftInteractor
  implements IBaseInteractor<IUpdateMentorshipDraftContext, MentorshipDraftResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute({
    draftId,
    dto,
    actorId,
    ability,
  }: IUpdateMentorshipDraftContext): Promise<MentorshipDraftResponse> {
    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const draft = await this.mentorshipDraftsRepository.findByIdForUpdate(draftId, em);

      if (!draft) {
        throw new NotFoundException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_FOUND);
      }

      assertIsDraftAuthor(draft.createdBy.id, actorId);
      assertDraftIsEditable(draft.status);

      if (dto.title) {
        draft.title = dto.title;
      }

      if (!dto.items) {
        return {
          draft,
          items: await this.mentorshipDraftItemsRepository.findByDraftId(draft.id, em),
        };
      }

      const items = await this.mentorshipDraftItemsService.validateDraftItems(
        { items: dto.items.map(toDraftItemInput), ability },
        em,
      );

      await this.mentorshipDraftItemsRepository.deleteByDraftId(draft.id, em);
      draft.updatedAt = dayjs().toDate();

      return { draft, items: this.mentorshipDraftItemsRepository.createItems(draft, items, em) };
    });

    return this.mentorshipDraftsSerializer.serializeDraft(view);
  }
}
