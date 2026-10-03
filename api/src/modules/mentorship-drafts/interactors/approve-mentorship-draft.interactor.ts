import { Injectable } from "@nestjs/common";

import dayjs from "dayjs";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { EPermission } from "@/modules/permissions/permissions.enums";

import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import {
  assertCanDecideDraft,
  assertDraftTransition,
  assertNoStaleDraftItems,
  toDecisionComment,
} from "../mentorship-drafts.helpers";
import type { IDecideMentorshipDraftContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class ApproveMentorshipDraftInteractor
  implements IBaseInteractor<IDecideMentorshipDraftContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IDecideMentorshipDraftContext): Promise<MentorshipDraftDetailResponse> {
    const { dto, actorId, ability } = context;

    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const draft = await this.mentorshipDraftsService.findVisibleForUpdate(context, em);

      assertCanDecideDraft({
        permission: EPermission.APPROVE,
        authorId: draft.createdBy.id,
        actorId,
        ability,
      });
      assertDraftTransition(draft.status, EMentorshipDraftStatus.APPROVED);
      assertNoStaleDraftItems(await this.mentorshipDraftItemsService.findStaleItems(draft.id, em));

      this.mentorshipDraftsRepository.assignFields(
        draft,
        {
          status: EMentorshipDraftStatus.APPROVED,
          approvedBy: actorId,
          decidedAt: dayjs().toDate(),
          decisionComment: toDecisionComment(dto.decisionComment),
        },
        em,
      );
      await em.flush();

      return this.mentorshipDraftsService.findVisibleDetail(context, em);
    });

    return this.mentorshipDraftsSerializer.serializeDetail(view);
  }
}
