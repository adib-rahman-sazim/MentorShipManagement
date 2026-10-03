import { Injectable } from "@nestjs/common";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MentorshipDraftItemsRepository } from "../mentorship-draft-items.repository";
import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import { toDraftItemInput } from "../mentorship-drafts.helpers";
import type { ICreateMentorshipDraftContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";

@Injectable()
export class CreateMentorshipDraftInteractor
  implements IBaseInteractor<ICreateMentorshipDraftContext, MentorshipDraftResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute({
    dto,
    actorId,
    ability,
  }: ICreateMentorshipDraftContext): Promise<MentorshipDraftResponse> {
    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const items = await this.mentorshipDraftItemsService.validateDraftItems(
        { items: dto.items.map(toDraftItemInput), ability },
        em,
      );
      const draft = this.mentorshipDraftsRepository.createDraft(
        { title: dto.title, status: EMentorshipDraftStatus.DRAFT, createdBy: actorId },
        em,
      );

      return { draft, items: this.mentorshipDraftItemsRepository.createItems(draft, items, em) };
    });

    return this.mentorshipDraftsSerializer.serializeDraft(view);
  }
}
