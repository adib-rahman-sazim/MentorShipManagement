import { ConflictException, Injectable } from "@nestjs/common";

import { UniqueConstraintViolationException } from "@mikro-orm/core";

import dayjs from "dayjs";

import { EMentorshipDraftStatus } from "@/common/enums/mentorships.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { MentorshipHierarchyService } from "@/modules/mentorships/mentorship-hierarchy.service";

import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "../mentorship-drafts.constants";
import { assertDraftTransition } from "../mentorship-drafts.helpers";
import type {
  IMentorshipDraftByIdContext,
  IPublishedMentorshipDraft,
} from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class PublishMentorshipDraftInteractor
  implements IBaseInteractor<IMentorshipDraftByIdContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipHierarchyService: MentorshipHierarchyService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IMentorshipDraftByIdContext): Promise<MentorshipDraftDetailResponse> {
    const { view, changedUserIds } = await this.publish(context);

    await this.mentorshipHierarchyService.invalidateForMentorshipChanges(changedUserIds);

    return this.mentorshipDraftsSerializer.serializeDetail(view);
  }

  private async publish(context: IMentorshipDraftByIdContext): Promise<IPublishedMentorshipDraft> {
    try {
      return await this.mentorshipDraftsRepository.transactional(async (em) => {
        const draft = await this.mentorshipDraftsService.findVisibleForUpdate(context, em);

        assertDraftTransition(draft.status, EMentorshipDraftStatus.PUBLISHED);

        const changedUserIds = await this.mentorshipDraftItemsService.publishItems(draft.id, em);

        this.mentorshipDraftsRepository.assignFields(
          draft,
          {
            status: EMentorshipDraftStatus.PUBLISHED,
            publishedBy: context.actorId,
            publishedAt: dayjs().toDate(),
          },
          em,
        );
        await em.flush();

        return {
          view: await this.mentorshipDraftsService.findVisibleDetail(context, em),
          changedUserIds,
        };
      });
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(MENTORSHIP_DRAFT_ERROR_MESSAGES.CONCURRENT_PUBLISH);
      }

      throw error;
    }
  }
}
