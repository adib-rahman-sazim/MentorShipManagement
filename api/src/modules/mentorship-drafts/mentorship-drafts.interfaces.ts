import type { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import type {
  EMentorshipDraftOperation,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import type { IMentorshipParticipant } from "@/modules/mentorships/mentorships.interfaces";

import type { CreateMentorshipDraftDto, UpdateMentorshipDraftDto } from "./mentorship-drafts.dtos";

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
