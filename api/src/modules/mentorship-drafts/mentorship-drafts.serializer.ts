import { Injectable } from "@nestjs/common";

import type { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { User } from "@/common/entities/users.entity";

import type {
  IMentorshipDraftDetailView,
  IMentorshipDraftSummaryView,
  IMentorshipDraftView,
} from "./mentorship-drafts.interfaces";
import type {
  MentorshipDraftDetailItemResponse,
  MentorshipDraftDetailResponse,
  MentorshipDraftItemResponse,
  MentorshipDraftPersonResponse,
  MentorshipDraftResponse,
  MentorshipDraftSummaryResponse,
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

  serializeSummary({
    draft,
    itemCount,
    allowedActions,
  }: IMentorshipDraftSummaryView): MentorshipDraftSummaryResponse {
    return {
      id: draft.id,
      title: draft.title,
      status: draft.status,
      createdBy: this.serializePerson(draft.createdBy),
      itemCount,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      submittedAt: draft.submittedAt ?? null,
      decidedAt: draft.decidedAt ?? null,
      publishedAt: draft.publishedAt ?? null,
      cancelledAt: draft.cancelledAt ?? null,
      allowedActions,
    };
  }

  serializeDetail({
    draft,
    items,
    allowedActions,
  }: IMentorshipDraftDetailView): MentorshipDraftDetailResponse {
    return {
      ...this.serializeSummary({ draft, itemCount: items.length, allowedActions }),
      reviewedBy: this.serializeOptionalPerson(draft.reviewedBy),
      approvedBy: this.serializeOptionalPerson(draft.approvedBy),
      publishedBy: this.serializeOptionalPerson(draft.publishedBy),
      cancelledBy: this.serializeOptionalPerson(draft.cancelledBy),
      decisionComment: draft.decisionComment ?? null,
      items: items.map((item) => this.serializeDetailItem(item)),
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

  private serializeDetailItem(item: MentorshipDraftItem): MentorshipDraftDetailItemResponse {
    return {
      id: item.id,
      operation: item.operation,
      subordinate: this.serializePerson(item.subordinate),
      proposedSupervisor: this.serializeOptionalPerson(item.proposedSupervisor),
      expectedCurrentMentorshipId: item.expectedCurrentMentorship?.id ?? null,
    };
  }

  private serializePerson(user: User): MentorshipDraftPersonResponse {
    return { id: user.id, name: user.name, role: user.role.code };
  }

  private serializeOptionalPerson(user?: User | null): MentorshipDraftPersonResponse | null {
    return user ? this.serializePerson(user) : null;
  }
}
