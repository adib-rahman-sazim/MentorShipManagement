import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MentorshipDraftItemsService } from "../mentorship-draft-items.service";
import type { IMentorshipDraftByIdContext } from "../mentorship-drafts.interfaces";
import type { MentorshipDraftChangeSummaryResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class GetMentorshipDraftChangeSummaryInteractor
  implements IBaseInteractor<IMentorshipDraftByIdContext, MentorshipDraftChangeSummaryResponse>
{
  constructor(
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftItemsService: MentorshipDraftItemsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(
    context: IMentorshipDraftByIdContext,
  ): Promise<MentorshipDraftChangeSummaryResponse> {
    const draft = await this.mentorshipDraftsService.findVisible(context);
    const items = await this.mentorshipDraftItemsService.findChangeSummaryItems(draft.id);

    return this.mentorshipDraftsSerializer.serializeChangeSummary({ draft, items });
  }
}
