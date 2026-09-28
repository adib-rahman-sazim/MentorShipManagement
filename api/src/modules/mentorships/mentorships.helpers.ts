import {
  type EMentorshipRelationshipType,
  EMentorshipViolation,
} from "@/common/enums/mentorships.enums";
import type { EUserRole } from "@/common/enums/roles.enums";
import { EUserState } from "@/common/enums/users.enums";

import { LEGAL_ROLE_PAIRS, MENTORSHIP_SUBTREE_MAX_DEPTH } from "./mentorships.constants";
import type {
  IMentorshipAssignmentInput,
  IMentorshipEdge,
  IMentorshipParticipant,
} from "./mentorships.interfaces";

export function isSelfMentorship(supervisorId: string, subordinateId: string): boolean {
  return supervisorId === subordinateId;
}

export function resolveRelationshipType(
  supervisorRole: EUserRole,
  subordinateRole: EUserRole,
): EMentorshipRelationshipType | null {
  const legalPair = LEGAL_ROLE_PAIRS.find(
    (pair) => pair.supervisorRole === supervisorRole && pair.subordinateRole === subordinateRole,
  );

  return legalPair?.relationshipType ?? null;
}

export function wouldCreateCycle(
  supervisorBySubordinate: ReadonlyMap<string, string>,
  subordinateId: string,
  proposedSupervisorId: string,
  maxDepth: number,
): boolean {
  const visitedIds = new Set<string>();
  let currentId: string | undefined = proposedSupervisorId;

  while (currentId !== undefined) {
    if (currentId === subordinateId || visitedIds.has(currentId) || visitedIds.size > maxDepth) {
      return true;
    }

    visitedIds.add(currentId);
    currentId = supervisorBySubordinate.get(currentId);
  }

  return false;
}

export function isInactiveParticipant(participant: IMentorshipParticipant): boolean {
  return participant.state !== EUserState.ACTIVE || participant.deletedAt !== null;
}

export function findAssignmentViolations({
  supervisor,
  subordinate,
  supervisorBySubordinate,
}: IMentorshipAssignmentInput): EMentorshipViolation[] {
  const violations: EMentorshipViolation[] = [];

  if (isSelfMentorship(supervisor.id, subordinate.id)) {
    violations.push(EMentorshipViolation.SELF_MENTORSHIP);
  } else if (
    wouldCreateCycle(
      supervisorBySubordinate,
      subordinate.id,
      supervisor.id,
      MENTORSHIP_SUBTREE_MAX_DEPTH,
    )
  ) {
    violations.push(EMentorshipViolation.CYCLE);
  }

  if (resolveRelationshipType(supervisor.role, subordinate.role) === null) {
    violations.push(EMentorshipViolation.ILLEGAL_ROLE_PAIR);
  }

  if (isInactiveParticipant(supervisor) || isInactiveParticipant(subordinate)) {
    violations.push(EMentorshipViolation.INACTIVE_USER);
  }

  return violations;
}

export function buildSupervisorBySubordinate(
  edges: readonly IMentorshipEdge[],
): Map<string, string> {
  return new Map(edges.map((edge) => [edge.subordinateId, edge.supervisorId]));
}