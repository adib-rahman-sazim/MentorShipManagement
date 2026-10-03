import type { ObjectQuery } from "@mikro-orm/core";

import type { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import type { User } from "@/common/entities/users.entity";
import type {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import type {
  IMentorshipParticipant,
  IMentorshipStart,
} from "@/modules/mentorships/mentorships.interfaces";
import type { EPermission } from "@/modules/permissions/permissions.enums";

import type {
  CreateMentorshipDraftDto,
  DecideMentorshipDraftDto,
  ListMentorshipDraftsQueryDto,
  UpdateMentorshipDraftDto,
} from "./mentorship-drafts.dtos";
import type { EMentorshipDraftAction } from "./mentorship-drafts.enums";

export interface IDraftItemInput {
  operation: EMentorshipDraftOperation;
  subordinateId: string;
  proposedSupervisorId: string | null;
}

export interface IValidatedDraftItem extends IDraftItemInput {
  expectedCurrentMentorshipId: string | null;
}

export interface IDraftItemViolation {
  subordinateId: string;
  violations: EMentorshipViolation[];
}

export interface IDraftItemsValidationInput {
  items: readonly IDraftItemInput[];
  participantsById: ReadonlyMap<string, IMentorshipParticipant>;
  supervisorBySubordinate: ReadonlyMap<string, string>;
}

export interface IValidateDraftItemsContext {
  items: readonly IDraftItemInput[];
  ability: TAppAbility;
}

export interface IMentorshipDraftView {
  draft: MentorshipDraft;
  items: MentorshipDraftItem[];
}

export interface IMentorshipDraftDetailView extends IMentorshipDraftView {
  allowedActions: EMentorshipDraftAction[];
}

export interface IMentorshipDraftSummaryView {
  draft: MentorshipDraft;
  itemCount: number;
  allowedActions: EMentorshipDraftAction[];
}

export interface IDraftItemCountRow {
  draftId: string;
  itemCount: number;
}

export interface IDraftActionContext {
  status: EMentorshipDraftStatus;
  authorId: string;
  itemCount: number;
  actorId: string;
  ability: TAppAbility;
}

export interface IDraftDecisionCheck {
  permission: EPermission;
  authorId: string;
  actorId: string;
  ability: TAppAbility;
}

export interface IDraftCancelCheck {
  status: EMentorshipDraftStatus;
  authorId: string;
  actorId: string;
  ability: TAppAbility;
}

export interface IMentorshipSnapshot {
  id: string;
  supervisorId: string;
  startedByDraftId: string | null;
  endedByDraftId: string | null;
}

export interface IDraftItemExpectation {
  subordinateId: string;
  expectedMentorship: IMentorshipSnapshot | null;
}

export interface IStaleDraftItem {
  subordinateId: string;
  expectedSupervisorId: string | null;
  currentSupervisorId: string | null;
  changedByDraftId: string | null;
}

export interface IDraftApplyPlan {
  endedMentorships: IMentorshipSnapshot[];
  startedMentorships: IMentorshipStart[];
}

export interface IPublishedMentorshipDraft {
  view: IMentorshipDraftDetailView;
  changedUserIds: string[];
}

export interface IDraftChangeSummaryItem {
  item: MentorshipDraftItem;
  currentSupervisor: User | null;
  relationshipType: EMentorshipRelationshipType | null;
  violations: EMentorshipViolation[];
  stale: IStaleDraftItem | null;
  overlappingDrafts: MentorshipDraft[];
}

export interface IMentorshipDraftChangeSummaryView {
  draft: MentorshipDraft;
  items: IDraftChangeSummaryItem[];
}

export interface IFindVisibleDraftsOptions {
  visibility: ObjectQuery<MentorshipDraft>;
  page: number;
  limit: number;
  status?: EMentorshipDraftStatus;
  createdById?: string;
}

export interface ICreateMentorshipDraftContext {
  dto: CreateMentorshipDraftDto;
  actorId: string;
  ability: TAppAbility;
}

export interface IUpdateMentorshipDraftContext {
  draftId: string;
  dto: UpdateMentorshipDraftDto;
  actorId: string;
  ability: TAppAbility;
}

export interface IMentorshipDraftByIdContext {
  draftId: string;
  actorId: string;
  ability: TAppAbility;
}

export interface IDecideMentorshipDraftContext extends IMentorshipDraftByIdContext {
  dto: DecideMentorshipDraftDto;
}

export interface IListMentorshipDraftsContext {
  query: ListMentorshipDraftsQueryDto;
  actorId: string;
  ability: TAppAbility;
}
