import { Injectable } from "@nestjs/common";

import type { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";

import type { IMentorshipDraftView } from "./mentorship-drafts.interfaces";
import type {
  MentorshipDraftItemResponse,
  MentorshipDraftResponse,
} from "./mentorship-drafts.responses";

@Injectable()
export class MentorshipDraftsSerializer {
  serializeDraft({ draft, items }: IMentorshipDraftView): MentorshipDraftResponse {
    return {
      id: draft.id,
      title: draft.title,
      status: draft.status,
      createdById: draft.createdBy.id,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      items: items.map((item) => this.serializeItem(item)),
    };
  }

  private serializeItem(item: MentorshipDraftItem): MentorshipDraftItemResponse {
    return {
      id: item.id,
      operation: item.operation,
      subordinateId: item.subordinate.id,
      proposedSupervisorId: item.proposedSupervisor?.id ?? null,
      expectedCurrentMentorshipId: item.expectedCurrentMentorship?.id ?? null,
    };
  }
}
