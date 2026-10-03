import { Injectable } from "@nestjs/common";

import dayjs from "dayjs";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { assertCanCancelDraft } from "../mentorship-drafts.helpers";
import type { IMentorshipDraftByIdContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class CancelMentorshipDraftInteractor
  implements IBaseInteractor<IMentorshipDraftByIdContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IMentorshipDraftByIdContext): Promise<MentorshipDraftDetailResponse> {
    const { actorId, ability } = context;

    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const draft = await this.mentorshipDraftsService.findVisibleForUpdate(context, em);

      assertCanCancelDraft({
        status: draft.status,
        authorId: draft.createdBy.id,
        actorId,
        ability,
      });

      this.mentorshipDraftsRepository.assignFields(
        draft,
        {
          status: EMentorshipDraftStatus.CANCELLED,
          cancelledBy: actorId,
          cancelledAt: dayjs().toDate(),
        },
        em,
      );
      await em.flush();

      return this.mentorshipDraftsService.findVisibleDetail(context, em);
    });

    return this.mentorshipDraftsSerializer.serializeDetail(view);
  }
}
