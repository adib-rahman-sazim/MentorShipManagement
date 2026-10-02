import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import type { IMentorshipDraftByIdContext } from "../mentorship-drafts.interfaces";
import type { MentorshipDraftDetailResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";
import { MentorshipDraftsService } from "../mentorship-drafts.service";

@Injectable()
export class GetMentorshipDraftInteractor
  implements IBaseInteractor<IMentorshipDraftByIdContext, MentorshipDraftDetailResponse>
{
  constructor(
    private readonly mentorshipDraftsService: MentorshipDraftsService,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute(context: IMentorshipDraftByIdContext): Promise<MentorshipDraftDetailResponse> {
    const view = await this.mentorshipDraftsService.findVisibleDetail(context);

    return this.mentorshipDraftsSerializer.serializeDetail(view);
  }
}
