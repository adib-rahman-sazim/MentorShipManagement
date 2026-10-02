import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { MentorshipDraftItemsRepository } from "../mentorship-draft-items.repository";
import { buildVisibleDraftsFilter, resolveAllowedDraftActions } from "../mentorship-drafts.helpers";
import type { IListMentorshipDraftsContext } from "../mentorship-drafts.interfaces";
import { MentorshipDraftsRepository } from "../mentorship-drafts.repository";
import type { PaginatedMentorshipDraftsResponse } from "../mentorship-drafts.responses";
import { MentorshipDraftsSerializer } from "../mentorship-drafts.serializer";

@Injectable()
export class ListMentorshipDraftsInteractor
  implements IBaseInteractor<IListMentorshipDraftsContext, PaginatedMentorshipDraftsResponse>
{
  constructor(
    private readonly mentorshipDraftsRepository: MentorshipDraftsRepository,
    private readonly mentorshipDraftItemsRepository: MentorshipDraftItemsRepository,
    private readonly mentorshipDraftsSerializer: MentorshipDraftsSerializer,
  ) {}

  async execute({
    query,
    actorId,
    ability,
  }: IListMentorshipDraftsContext): Promise<PaginatedMentorshipDraftsResponse> {
    const { page, limit } = query;

    const { drafts, total } = await this.mentorshipDraftsRepository.findVisiblePaginated({
      visibility: buildVisibleDraftsFilter(actorId),
      page,
      limit,
      status: query.status,
      createdById: query.mine ? actorId : undefined,
    });
    const itemCountByDraftId = await this.mentorshipDraftItemsRepository.countByDraftIds(
      drafts.map((draft) => draft.id),
    );

    return {
      data: drafts.map((draft) => {
        const itemCount = itemCountByDraftId.get(draft.id) ?? 0;

        return this.mentorshipDraftsSerializer.serializeSummary({
          draft,
          itemCount,
          allowedActions: resolveAllowedDraftActions({
            status: draft.status,
            authorId: draft.createdBy.id,
            itemCount,
            actorId,
            ability,
          }),
        });
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
