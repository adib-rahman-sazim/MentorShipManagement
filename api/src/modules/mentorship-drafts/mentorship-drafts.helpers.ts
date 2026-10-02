import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";

import type { User } from "@/common/entities/users.entity";
import {
  EMentorshipDraftOperation,
  EMentorshipDraftStatus,
  type EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import type { TAppAbility } from "@/modules/casl/casl.types";
import { LEGAL_ROLE_PAIRS } from "@/modules/mentorships/mentorships.constants";
import { findAssignmentViolations } from "@/modules/mentorships/mentorships.helpers";
import type { IMentorshipParticipant } from "@/modules/mentorships/mentorships.interfaces";
import { EPermission, EResource } from "@/modules/permissions/permissions.enums";

import { MENTORSHIP_DRAFT_ERROR_MESSAGES } from "./mentorship-drafts.constants";
import type { MentorshipDraftItemDto } from "./mentorship-drafts.dtos";
import { EMentorshipDraftErrorCode } from "./mentorship-drafts.enums";
import type {
  IDraftItemInput,
  IDraftItemsValidationInput,
  IDraftItemViolation,
} from "./mentorship-drafts.interfaces";

export function toDraftItemInput(item: MentorshipDraftItemDto): IDraftItemInput {
  return {
    operation: item.operation,
    subordinateId: item.subordinateId,
    proposedSupervisorId: item.proposedSupervisorId ?? null,
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
