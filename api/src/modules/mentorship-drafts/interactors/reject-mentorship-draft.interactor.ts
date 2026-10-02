import { Injectable } from "@nestjs/common";

import dayjs from "dayjs";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { EPermission } from "@/modules/permissions/permissions.enums";

import {
  assertCanDecideDraft,
  assertDraftTransition,
  toDecisionComment,
} from "../mentorship-drafts.helpers";
import type { IDecideMentorshipDraftContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class RejectMentorshipDraftInteractor
  implements IBaseInteractor<IDecideMentorshipDraftContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IDecideMentorshipDraftContext): Promise<MentorshipDraftDetailResponse> {
    const { dto, actorId, ability } = context;

    const view = await this.mentorshipDraftsRepository.transactional(async (em) => {
      const draft = await this.mentorshipDraftsService.findVisibleForUpdate(context, em);

      assertCanDecideDraft({
        permission: EPermission.REVIEW,
        authorId: draft.createdBy.id,
        actorId,
        ability,
      });
      assertDraftTransition(draft.status, EMentorshipDraftStatus.REJECTED);

      this.mentorshipDraftsRepository.assignFields(
        draft,
        {
          status: EMentorshipDraftStatus.REJECTED,
          reviewedBy: actorId,
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
