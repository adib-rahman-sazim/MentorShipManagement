import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";

import type { ObjectQuery } from "@mikro-orm/core";

import type { MentorshipDraftItem } from "@/common/entities/mentorship-draft-items.entity";
import type { MentorshipDraft } from "@/common/entities/mentorship-drafts.entity";
import type { Mentorship } from "@/common/entities/mentorships.entity";
import type { User } from "@/common/entities/users.entity";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  type EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import { LEGAL_ROLE_PAIRS } from "@/modules/mentorships/mentorships.constants";
import {
  buildSupervisorBySubordinate,
  findAssignmentViolations,
} from "@/modules/mentorships/mentorships.helpers";
import type { IMentorshipParticipant } from "@/modules/mentorships/mentorships.interfaces";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";

import {
  DRAFT_STATUS_TRANSITIONS,
  MENTORSHIP_DRAFT_ERROR_MESSAGES,
  SUBMITTED_DRAFT,
} from "./mentorship-drafts.constants";
import type { MentorshipDraftItemDto } from "./mentorship-drafts.dtos";
import { EMentorshipDraftAction, EMentorshipDraftErrorCode } from "./mentorship-drafts.enums";
import type {
  IDraftActionContext,
  IDraftApplyPlan,
  IDraftDecisionCheck,
  IDraftItemExpectation,
  IDraftItemInput,
  IDraftItemsValidationInput,
  IDraftItemViolation,
  IMentorshipSnapshot,
  IStaleDraftItem,
} from "./mentorship-drafts.interfaces";

export function toDraftItemInput(item: MentorshipDraftItemDto): IDraftItemInput {
  return {
    operation: item.operation,
    subordinateId: item.subordinateId,
    proposedSupervisorId: item.proposedSupervisorId ?? null,
  };
}

export function toStoredDraftItemInput(item: MentorshipDraftItem): IDraftItemInput {
  return {
    operation: item.operation,
    subordinateId: item.subordinate.id,
    proposedSupervisorId: item.proposedSupervisor?.id ?? null,
  };
}

export function toMentorshipParticipant(user: User): IMentorshipParticipant {
  return {
    id: user.id,
    role: user.role.code,
    state: user.state,
    deletedAt: user.deletedAt ?? null,
  };
}

export function collectDraftItemUserIds(items: readonly IDraftItemInput[]): string[] {
  const userIds = items.flatMap((item) =>
    item.proposedSupervisorId === null
      ? [item.subordinateId]
      : [item.subordinateId, item.proposedSupervisorId],
  );

  return [...new Set(userIds)];
}

export function resolveItemRelationshipType(
  item: IDraftItemInput,
  participantsById: ReadonlyMap<string, IMentorshipParticipant>,
): EMentorshipRelationshipType | null {
  const subordinate = participantsById.get(item.subordinateId);

  if (!subordinate) {
    return null;
  }

  return (
    LEGAL_ROLE_PAIRS.find((pair) => pair.subordinateRole === subordinate.role)?.relationshipType ??
    null
  );
}

export function canAssignRelationship(
  ability: TAppAbility,
  relationshipType: EMentorshipRelationshipType,
): boolean {
  return ability.can(EPermission.ASSIGN, {
    __caslSubjectType__: EResource.MENTORSHIP,
    relationshipType,
  });
}

export function assertCanAssignDraftItems(
  items: readonly IDraftItemInput[],
  participantsById: ReadonlyMap<string, IMentorshipParticipant>,
  ability: TAppAbility,
): void {
  const isAnyItemRefused = items.some((item) => {
    const relationshipType = resolveItemRelationshipType(item, participantsById);

    return relationshipType !== null && !canAssignRelationship(ability, relationshipType);
  });

  if (isAnyItemRefused) {
    throw new ForbiddenException(MENTORSHIP_DRAFT_ERROR_MESSAGES.ASSIGN_FORBIDDEN);
  }
}

export function findOperationStateViolations(
  operation: EMentorshipDraftOperation,
  currentSupervisorId: string | undefined,
  proposedSupervisorId: string | null,
): EMentorshipViolation[] {
  const isAssigned = currentSupervisorId !== undefined;

  switch (operation) {
    case EMentorshipDraftOperation.ASSIGN:
      return isAssigned ? [EMentorshipViolation.ALREADY_ASSIGNED] : [];
    case EMentorshipDraftOperation.REASSIGN:
      if (!isAssigned) {
        return [EMentorshipViolation.NOT_ASSIGNED];
      }

      return currentSupervisorId === proposedSupervisorId
        ? [EMentorshipViolation.SAME_SUPERVISOR]
        : [];
    case EMentorshipDraftOperation.UNASSIGN:
      return isAssigned ? [] : [EMentorshipViolation.NOT_ASSIGNED];
  }
}

export function applyDraftItems(
  supervisorBySubordinate: ReadonlyMap<string, string>,
  items: readonly IDraftItemInput[],
): Map<string, string> {
  const projected = new Map(supervisorBySubordinate);

  for (const item of items) {
    if (item.proposedSupervisorId === null) {
      projected.delete(item.subordinateId);
    } else {
      projected.set(item.subordinateId, item.proposedSupervisorId);
    }
  }

  return projected;
}

export function findDraftItemViolations({
  items,
  participantsById,
  supervisorBySubordinate,
}: IDraftItemsValidationInput): IDraftItemViolation[] {
  const projectedSupervisorBySubordinate = applyDraftItems(supervisorBySubordinate, items);

  return items
    .map((item) => ({
      subordinateId: item.subordinateId,
      violations: findItemViolations(
        item,
        participantsById,
        supervisorBySubordinate,
        projectedSupervisorBySubordinate,
      ),
    }))
    .filter((itemViolation) => itemViolation.violations.length > 0);
}

export function assertNoDraftItemViolations(itemViolations: IDraftItemViolation[]): void {
  if (itemViolations.length > 0) {
    throw new BadRequestException(
      {
        message: MENTORSHIP_DRAFT_ERROR_MESSAGES.INVALID_ITEMS,
        errorCode: EMentorshipDraftErrorCode.INVALID_ITEMS,
      },
      { cause: itemViolations },
    );
  }
}

export function assertIsDraftAuthor(authorId: string, actorId: string): void {
  if (authorId !== actorId) {
    throw new ForbiddenException(MENTORSHIP_DRAFT_ERROR_MESSAGES.NOT_DRAFT_AUTHOR);
  }
}

export function assertDraftIsEditable(status: EMentorshipDraftStatus): void {
  if (status !== EMentorshipDraftStatus.DRAFT) {
    throw new ConflictException(MENTORSHIP_DRAFT_ERROR_MESSAGES.DRAFT_NOT_EDITABLE);
  }
}

export function canTransitionDraft(
  from: EMentorshipDraftStatus,
  to: EMentorshipDraftStatus,
): boolean {
  return DRAFT_STATUS_TRANSITIONS[from].includes(to);
}

export function assertDraftTransition(
  from: EMentorshipDraftStatus,
  to: EMentorshipDraftStatus,
): void {
  if (!canTransitionDraft(from, to)) {
    throw new ConflictException(MENTORSHIP_DRAFT_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
  }
}

export function assertDraftHasItems(itemCount: number): void {
  if (itemCount === 0) {
    throw new BadRequestException(MENTORSHIP_DRAFT_ERROR_MESSAGES.EMPTY_DRAFT);
  }
}

export function canDecideDraft({
  permission,
  authorId,
  actorId,
  ability,
}: IDraftDecisionCheck): boolean {
  return (
    authorId !== actorId &&
    ability.can(permission, { __caslSubjectType__: EResource.DRAFT, createdBy: authorId })
  );
}

export function assertCanDecideDraft(check: IDraftDecisionCheck): void {
  if (!canDecideDraft(check)) {
    throw new ForbiddenException(MENTORSHIP_DRAFT_ERROR_MESSAGES.OWN_DRAFT_DECISION);
  }
}

export function toDecisionComment(comment?: string): string | null {
  const trimmedComment = comment?.trim();

  return trimmedComment ? trimmedComment : null;
}

export function toMentorshipSnapshot(mentorship: Mentorship): IMentorshipSnapshot {
  return {
    id: mentorship.id,
    supervisorId: mentorship.supervisor.id,
    startedByDraftId: mentorship.startedByDraft?.id ?? null,
    endedByDraftId: mentorship.endedByDraft?.id ?? null,
  };
}

export function toDraftItemExpectation(item: MentorshipDraftItem): IDraftItemExpectation {
  return {
    subordinateId: item.subordinate.id,
    expectedMentorship: item.expectedCurrentMentorship
      ? toMentorshipSnapshot(item.expectedCurrentMentorship)
      : null,
  };
}

export function toLiveMentorshipBySubordinate(
  mentorships: readonly Mentorship[],
): Map<string, IMentorshipSnapshot> {
  return new Map(
    mentorships.map((mentorship) => [mentorship.subordinate.id, toMentorshipSnapshot(mentorship)]),
  );
}

export function toLiveSupervisorBySubordinate(
  mentorships: readonly Mentorship[],
): Map<string, string> {
  return buildSupervisorBySubordinate(
    mentorships.map((mentorship) => ({
      supervisorId: mentorship.supervisor.id,
      subordinateId: mentorship.subordinate.id,
    })),
  );
}

export function groupDraftsBySubordinate(
  items: readonly MentorshipDraftItem[],
): Map<string, MentorshipDraft[]> {
  const draftsBySubordinate = new Map<string, MentorshipDraft[]>();

  for (const item of items) {
    const drafts = draftsBySubordinate.get(item.subordinate.id) ?? [];
    drafts.push(item.draft);
    draftsBySubordinate.set(item.subordinate.id, drafts);
  }

  return draftsBySubordinate;
}

export function findStaleDraftItems(
  items: readonly IDraftItemExpectation[],
  liveMentorshipBySubordinate: ReadonlyMap<string, IMentorshipSnapshot>,
): IStaleDraftItem[] {
  return items.flatMap(({ subordinateId, expectedMentorship }) => {
    const liveMentorship = liveMentorshipBySubordinate.get(subordinateId) ?? null;

    if (liveMentorship?.id === expectedMentorship?.id) {
      return [];
    }

    return [
      {
        subordinateId,
        expectedSupervisorId: expectedMentorship?.supervisorId ?? null,
        currentSupervisorId: liveMentorship?.supervisorId ?? null,
        changedByDraftId:
          liveMentorship?.startedByDraftId ?? expectedMentorship?.endedByDraftId ?? null,
      },
    ];
  });
}

export function assertNoStaleDraftItems(staleItems: IStaleDraftItem[]): void {
  if (staleItems.length > 0) {
    throw new ConflictException(
      {
        message: MENTORSHIP_DRAFT_ERROR_MESSAGES.STALE_ITEMS,
        errorCode: EMentorshipDraftErrorCode.STALE_ITEMS,
      },
      { cause: staleItems },
    );
  }
}

export function assertNoPublishViolations(itemViolations: IDraftItemViolation[]): void {
  if (itemViolations.length > 0) {
    throw new ConflictException(
      {
        message: MENTORSHIP_DRAFT_ERROR_MESSAGES.NO_LONGER_VALID_ITEMS,
        errorCode: EMentorshipDraftErrorCode.INVALID_ITEMS,
      },
      { cause: itemViolations },
    );
  }
}

export function buildDraftApplyPlan(
  items: readonly IDraftItemInput[],
  liveMentorshipBySubordinate: ReadonlyMap<string, IMentorshipSnapshot>,
  participantsById: ReadonlyMap<string, IMentorshipParticipant>,
): IDraftApplyPlan {
  return {
    endedMentorships: items.flatMap(
      (item) => liveMentorshipBySubordinate.get(item.subordinateId) ?? [],
    ),
    startedMentorships: items.flatMap((item) => {
      const relationshipType = resolveItemRelationshipType(item, participantsById);

      if (item.proposedSupervisorId === null || relationshipType === null) {
        return [];
      }

      return [
        {
          supervisorId: item.proposedSupervisorId,
          subordinateId: item.subordinateId,
          relationshipType,
        },
      ];
    }),
  };
}

export function buildVisibleDraftsFilter(actorId: string): ObjectQuery<MentorshipDraft> {
  return { $or: [{ createdBy: actorId }, SUBMITTED_DRAFT] };
}

export function resolveAllowedDraftActions({
  status,
  authorId,
  itemCount,
  actorId,
  ability,
}: IDraftActionContext): EMentorshipDraftAction[] {
  const isAuthor = authorId === actorId;
  const canWriteDrafts = ability.can(EPermission.CREATE, EResource.DRAFT);
  const canPublishDrafts = ability.can(EPermission.PUBLISH, EResource.DRAFT);

  const actionChecks: [EMentorshipDraftAction, boolean][] = [
    [
      EMentorshipDraftAction.EDIT,
      isAuthor && canWriteDrafts && status === EMentorshipDraftStatus.DRAFT,
    ],
    [
      EMentorshipDraftAction.SUBMIT,
      isAuthor &&
        canWriteDrafts &&
        itemCount > 0 &&
        canTransitionDraft(status, EMentorshipDraftStatus.IN_REVIEW),
    ],
    [
      EMentorshipDraftAction.APPROVE,
      canDecideDraft({ permission: EPermission.APPROVE, authorId, actorId, ability }) &&
        canTransitionDraft(status, EMentorshipDraftStatus.APPROVED),
    ],
    [
      EMentorshipDraftAction.REJECT,
      canDecideDraft({ permission: EPermission.REVIEW, authorId, actorId, ability }) &&
        canTransitionDraft(status, EMentorshipDraftStatus.REJECTED),
    ],
    [
      EMentorshipDraftAction.PUBLISH,
      canPublishDrafts && canTransitionDraft(status, EMentorshipDraftStatus.PUBLISHED),
    ],
    [
      EMentorshipDraftAction.CANCEL,
      isAuthor && canTransitionDraft(status, EMentorshipDraftStatus.CANCELLED),
    ],
  ];

  return actionChecks.filter(([, isAllowed]) => isAllowed).map(([action]) => action);
}

function findItemViolations(
  item: IDraftItemInput,
  participantsById: ReadonlyMap<string, IMentorshipParticipant>,
  liveSupervisorBySubordinate: ReadonlyMap<string, string>,
  projectedSupervisorBySubordinate: ReadonlyMap<string, string>,
): EMentorshipViolation[] {
  const subordinate = participantsById.get(item.subordinateId);
  const proposedSupervisor =
    item.proposedSupervisorId === null ? null : participantsById.get(item.proposedSupervisorId);

  if (!subordinate || proposedSupervisor === undefined) {
    return [EMentorshipViolation.USER_NOT_FOUND];
  }

  const violations = findOperationStateViolations(
    item.operation,
    liveSupervisorBySubordinate.get(item.subordinateId),
    item.proposedSupervisorId,
  );

  if (proposedSupervisor !== null) {
    violations.push(
      ...findAssignmentViolations({
        supervisor: proposedSupervisor,
        subordinate,
        supervisorBySubordinate: projectedSupervisorBySubordinate,
      }),
    );
  }

  return violations;
}
