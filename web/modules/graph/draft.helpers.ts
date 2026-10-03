import { EGraphNodeType, EGraphSelectionKind } from "@/modules/graph/graph.enums";
import { USER_ROLE_LABELS } from "@/modules/users/users.constants";
import { canPerform } from "@/shared/providers/AbilityProvider/AbilityProvider.helpers";
import type { TAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import {
  EMentorshipDraftErrorCode,
  EMentorshipDraftOperation,
  EPermission,
  EResource,
  EUserRole,
  EUserState,
  IMentorshipDraftDetailItemResponse,
  IMentorshipDraftInvalidItemsResponse,
  IMentorshipGraphEdgeResponse,
  IMentorshipGraphNodeResponse,
  IMentorshipGraphResponse,
} from "@/shared/typedefs";
import { isApiErrorMessage } from "@/shared/utils/errors";

import {
  CONNECTION_OK,
  LOOP_CHECK_MAX_DEPTH,
  LOOP_REASON,
  MOVE_SUPERVISOR_END_REASON,
  NO_MENTOR_NAME,
  PROPOSED_EDGE_CLASS,
  PROPOSED_EDGE_ID_PREFIX,
  RELATIONSHIP_TYPE_BY_SUBORDINATE_ROLE,
  REPLACED_EDGE_CLASS,
  UNKNOWN_PERSON_REASON,
  VIOLATION_LABELS,
} from "./draft.constants";
import { EDraftNoticeKind } from "./draft.enums";
import type {
  TConnectionCheck,
  TConnectionContext,
  TDraftChange,
  TDraftConnection,
  TDraftContext,
  TDraftEdge,
  TDraftItem,
  TDraftNotice,
  TDraftNoticeContext,
  TDraftSnapshot,
  TDraftUpdate,
  TDraftViolations,
  TGraphIndex,
  TOperationCounts,
} from "./draft.types";
import { GRAPH_EDGE_TYPE, SUBORDINATE_ROLE, SUPERVISOR_ROLE } from "./graph.constants";
import type { TGraphNode, TGraphSelection } from "./graph.types";

export function indexGraph({ nodes, edges }: IMentorshipGraphResponse): TGraphIndex {
  return {
    peopleById: new Map(nodes.map((node) => [node.id, node])),
    liveSupervisorById: new Map(edges.map((edge) => [edge.subordinateId, edge.supervisorId])),
  };
}

export function toProposedEdgeId(subordinateId: string): string {
  return `${PROPOSED_EDGE_ID_PREFIX}${subordinateId}`;
}

export function isProposedEdgeId(edgeId: string): boolean {
  return edgeId.startsWith(PROPOSED_EDGE_ID_PREFIX);
}

export function canChangeSupervisorOf(ability: TAppAbility, role: EUserRole): boolean {
  const relationshipType = RELATIONSHIP_TYPE_BY_SUBORDINATE_ROLE[role];

  return relationshipType
    ? canPerform(ability, EPermission.ASSIGN, EResource.MENTORSHIP, { relationshipType })
    : false;
}

export function getDraftOperation(
  liveSupervisorId: string | undefined,
  proposedSupervisorId: string | null,
): EMentorshipDraftOperation | null {
  if (proposedSupervisorId === null) {
    return liveSupervisorId === undefined ? null : EMentorshipDraftOperation.UNASSIGN;
  }

  if (liveSupervisorId === undefined) {
    return EMentorshipDraftOperation.ASSIGN;
  }

  return liveSupervisorId === proposedSupervisorId ? null : EMentorshipDraftOperation.REASSIGN;
}

export function stageChange(
  items: TDraftItem[],
  index: TGraphIndex,
  subordinateId: string,
  proposedSupervisorId: string | null,
): TDraftItem[] {
  const operation = getDraftOperation(
    index.liveSupervisorById.get(subordinateId),
    proposedSupervisorId,
  );
  const position = items.findIndex((item) => item.subordinateId === subordinateId);

  if (operation === null) {
    return removeChange(items, subordinateId);
  }

  const change = { operation, subordinateId, proposedSupervisorId };

  return position === -1
    ? [...items, change]
    : items.map((item, itemIndex) => (itemIndex === position ? change : item));
}

export function removeChange(items: TDraftItem[], subordinateId: string): TDraftItem[] {
  return items.filter((item) => item.subordinateId !== subordinateId);
}

export function getProjectedSupervisors(
  index: TGraphIndex,
  items: readonly TDraftItem[],
): Map<string, string> {
  const projected = new Map(index.liveSupervisorById);

  for (const { subordinateId, proposedSupervisorId } of items) {
    if (proposedSupervisorId === null) {
      projected.delete(subordinateId);
    } else {
      projected.set(subordinateId, proposedSupervisorId);
    }
  }

  return projected;
}

export function wouldCreateLoop(
  supervisorById: ReadonlyMap<string, string>,
  subordinateId: string,
  supervisorId: string,
): boolean {
  const visitedIds = new Set<string>();
  let currentId: string | undefined = supervisorId;

  while (currentId !== undefined) {
    if (currentId === subordinateId || visitedIds.has(currentId)) {
      return true;
    }

    if (visitedIds.size > LOOP_CHECK_MAX_DEPTH) {
      return true;
    }

    visitedIds.add(currentId);
    currentId = supervisorById.get(currentId);
  }

  return false;
}

function refuse(reason: string): TConnectionCheck {
  return { ok: false, reason };
}

function getRolePairReason(subordinate: IMentorshipGraphNodeResponse): string {
  const supervisorRole = SUPERVISOR_ROLE[subordinate.role];

  return supervisorRole
    ? `Only a ${USER_ROLE_LABELS[supervisorRole]} can mentor ${subordinate.name}.`
    : `${subordinate.name} can't have a mentor.`;
}

function getPermissionReason(subordinate: IMentorshipGraphNodeResponse): string {
  const supervisorRole = SUPERVISOR_ROLE[subordinate.role] ?? subordinate.role;

  return `You can't change ${USER_ROLE_LABELS[supervisorRole]} → ${USER_ROLE_LABELS[subordinate.role]} links.`;
}

function getAlreadyMentoredReason(
  subordinate: IMentorshipGraphNodeResponse,
  supervisor: IMentorshipGraphNodeResponse | undefined,
): string {
  const supervisorName = supervisor?.name ?? NO_MENTOR_NAME;

  return `${subordinate.name} is already mentored by ${supervisorName}. To move them, drag the top end of that link instead.`;
}

export function checkStagedConnection(
  { source, target }: TDraftConnection,
  { index, items, ability, movingSubordinateId }: TConnectionContext,
): TConnectionCheck {
  const supervisor = index.peopleById.get(source);
  const subordinate = index.peopleById.get(target);

  if (!supervisor || !subordinate) {
    return refuse(UNKNOWN_PERSON_REASON);
  }

  if (supervisor.id === subordinate.id) {
    return refuse(`${subordinate.name} can't mentor themselves.`);
  }

  if (SUPERVISOR_ROLE[subordinate.role] !== supervisor.role) {
    return refuse(getRolePairReason(subordinate));
  }

  if (!canChangeSupervisorOf(ability, subordinate.role)) {
    return refuse(getPermissionReason(subordinate));
  }

  const inactivePerson = [supervisor, subordinate].find(
    ({ state }) => state === EUserState.INACTIVE,
  );

  if (inactivePerson) {
    return refuse(`${inactivePerson.name} is inactive.`);
  }

  const projected = getProjectedSupervisors(index, items);
  const currentSupervisorId = projected.get(subordinate.id);

  if (currentSupervisorId !== undefined && subordinate.id !== movingSubordinateId) {
    return refuse(getAlreadyMentoredReason(subordinate, index.peopleById.get(currentSupervisorId)));
  }

  if (wouldCreateLoop(projected, subordinate.id, supervisor.id)) {
    return refuse(LOOP_REASON);
  }

  return CONNECTION_OK;
}

export function connectInDraft(context: TDraftContext, connection: TDraftConnection): TDraftUpdate {
  const check = checkStagedConnection(connection, { ...context, movingSubordinateId: null });

  return check.ok
    ? {
        items: stageChange(context.items, context.index, connection.target, connection.source),
        reason: null,
      }
    : { items: context.items, reason: check.reason };
}

export function reconnectInDraft(
  context: TDraftContext,
  edge: TDraftEdge,
  connection: TDraftConnection,
): TDraftUpdate {
  if (connection.target !== edge.target) {
    return { items: context.items, reason: MOVE_SUPERVISOR_END_REASON };
  }

  const check = checkStagedConnection(connection, {
    ...context,
    movingSubordinateId: edge.target,
  });

  return check.ok
    ? {
        items: stageChange(context.items, context.index, edge.target, connection.source),
        reason: null,
      }
    : { items: context.items, reason: check.reason };
}

export function deleteInDraft(
  { index, items, ability }: TDraftContext,
  edges: readonly TDraftEdge[],
): TDraftItem[] {
  return edges.reduce((current, edge) => {
    const subordinate = index.peopleById.get(edge.target);

    if (!subordinate || !canChangeSupervisorOf(ability, subordinate.role)) {
      return current;
    }

    return edge.data?.operation
      ? removeChange(current, edge.target)
      : stageChange(current, index, edge.target, null);
  }, items);
}

export function applyDraftToGraph(
  liveEdges: readonly IMentorshipGraphEdgeResponse[],
  items: readonly TDraftItem[],
): TDraftEdge[] {
  const itemBySubordinate = new Map(items.map((item) => [item.subordinateId, item]));

  const edges: TDraftEdge[] = liveEdges.map(({ id, supervisorId, subordinateId }) => {
    const operation = itemBySubordinate.get(subordinateId)?.operation ?? null;

    return {
      id,
      source: supervisorId,
      target: subordinateId,
      type: GRAPH_EDGE_TYPE,
      className: operation ? REPLACED_EDGE_CLASS[operation] : undefined,
      data: { operation, isProposed: false },
    };
  });

  for (const { operation, subordinateId, proposedSupervisorId } of items) {
    if (proposedSupervisorId !== null) {
      edges.push({
        id: toProposedEdgeId(subordinateId),
        source: proposedSupervisorId,
        target: subordinateId,
        type: GRAPH_EDGE_TYPE,
        className: PROPOSED_EDGE_CLASS[operation],
        data: { operation, isProposed: true },
      });
    }
  }

  return edges;
}

export function withEdgePermissions(
  edges: TDraftEdge[],
  { index, ability }: Pick<TDraftContext, "index" | "ability">,
  isEditable: boolean,
  selectedLinkId: string | null,
): TDraftEdge[] {
  return edges.map((edge) => {
    const subordinate = index.peopleById.get(edge.target);
    const canChange =
      isEditable && subordinate !== undefined && canChangeSupervisorOf(ability, subordinate.role);
    const isReplaced = Boolean(edge.data?.operation) && !edge.data?.isProposed;
    const isMovable = canChange && !isReplaced && edge.id === selectedLinkId;

    return {
      ...edge,
      deletable: canChange,
      reconnectable: isMovable ? "source" : false,
    };
  });
}

export function withDraftNodeData(
  nodes: TGraphNode[],
  index: TGraphIndex,
  items: readonly TDraftItem[],
  violations: TDraftViolations,
  isEditable: boolean,
): TGraphNode[] {
  const projected = getProjectedSupervisors(index, items);
  const operationBySubordinate = new Map(items.map((item) => [item.subordinateId, item.operation]));
  const subordinateCounts = new Map<string, number>();

  for (const supervisorId of projected.values()) {
    subordinateCounts.set(supervisorId, (subordinateCounts.get(supervisorId) ?? 0) + 1);
  }

  return nodes.map((node) =>
    node.type === EGraphNodeType.PERSON
      ? {
          ...node,
          data: {
            ...node.data,
            subordinateCount: subordinateCounts.get(node.id) ?? 0,
            hasSupervisor: projected.has(node.id),
            draft: {
              operation: operationBySubordinate.get(node.id) ?? null,
              hasViolation: (violations[node.id]?.length ?? 0) > 0,
              isTargetConnectable: isEditable && SUPERVISOR_ROLE[node.data.role] !== undefined,
              isSourceConnectable: isEditable && SUBORDINATE_ROLE[node.data.role] !== undefined,
            },
          },
        }
      : node,
  );
}

function getPersonName(index: TGraphIndex, personId: string | null | undefined): string {
  return (personId ? index.peopleById.get(personId)?.name : undefined) ?? NO_MENTOR_NAME;
}

export function getChangeSentence(
  operation: EMentorshipDraftOperation,
  name: string,
  fromName: string,
  toName: string,
): string {
  switch (operation) {
    case EMentorshipDraftOperation.ASSIGN:
      return `${toName} will mentor ${name}.`;
    case EMentorshipDraftOperation.REASSIGN:
      return `${name} moves from ${fromName} to ${toName}.`;
    case EMentorshipDraftOperation.UNASSIGN:
      return `${fromName} stops mentoring ${name}.`;
  }
}

export function getDraftChanges(
  items: readonly TDraftItem[],
  index: TGraphIndex,
  violations: TDraftViolations,
): TDraftChange[] {
  return items.map(({ operation, subordinateId, proposedSupervisorId }) => {
    const subordinate = index.peopleById.get(subordinateId);
    const name = subordinate?.name ?? subordinateId;
    const fromName = getPersonName(index, index.liveSupervisorById.get(subordinateId));
    const toName = getPersonName(index, proposedSupervisorId);

    return {
      subordinateId,
      operation,
      name,
      roleLabel: subordinate ? USER_ROLE_LABELS[subordinate.role] : "",
      fromName,
      toName,
      sentence: getChangeSentence(operation, name, fromName, toName),
      violations: (violations[subordinateId] ?? []).map((violation) => VIOLATION_LABELS[violation]),
    };
  });
}

function countOperation(
  items: readonly TDraftItem[],
  operation: EMentorshipDraftOperation,
): number {
  return items.filter((item) => item.operation === operation).length;
}

export function countDraftOperations(items: readonly TDraftItem[]): TOperationCounts {
  return {
    [EMentorshipDraftOperation.ASSIGN]: countOperation(items, EMentorshipDraftOperation.ASSIGN),
    [EMentorshipDraftOperation.REASSIGN]: countOperation(items, EMentorshipDraftOperation.REASSIGN),
    [EMentorshipDraftOperation.UNASSIGN]: countOperation(items, EMentorshipDraftOperation.UNASSIGN),
  };
}

function getSubordinateIdForSelection(
  selection: TGraphSelection,
  { graph, index, items }: TDraftNoticeContext,
): string | null {
  if (selection.kind === EGraphSelectionKind.PERSON) {
    return index.peopleById.has(selection.id) ? selection.id : null;
  }

  if (isProposedEdgeId(selection.id)) {
    const subordinateId = selection.id.slice(PROPOSED_EDGE_ID_PREFIX.length);

    return items.some((item) => item.subordinateId === subordinateId) ? subordinateId : null;
  }

  return graph.edges.find(({ id }) => id === selection.id)?.subordinateId ?? null;
}

export function getDraftNotice(
  selection: TGraphSelection,
  context: TDraftNoticeContext,
): TDraftNotice | null {
  const { index, items, ability } = context;
  const subordinateId = getSubordinateIdForSelection(selection, context);
  const subordinate = subordinateId ? index.peopleById.get(subordinateId) : undefined;

  if (!subordinateId || !subordinate) {
    return null;
  }

  const item = items.find((change) => change.subordinateId === subordinateId);

  if (item) {
    const [change] = getDraftChanges([item], index, {});

    return {
      kind: EDraftNoticeKind.CHANGED,
      subordinateId,
      operation: item.operation,
      text: change?.sentence ?? "",
    };
  }

  if (selection.kind === EGraphSelectionKind.PERSON) {
    return null;
  }

  return canChangeSupervisorOf(ability, subordinate.role)
    ? { kind: EDraftNoticeKind.REMOVABLE, subordinateId, operation: null, text: "" }
    : {
        kind: EDraftNoticeKind.BLOCKED,
        subordinateId,
        operation: null,
        text: getPermissionReason(subordinate),
      };
}

export function toDraftItems(items: readonly IMentorshipDraftDetailItemResponse[]): TDraftItem[] {
  return items.map(({ operation, subordinate, proposedSupervisor }) => ({
    operation,
    subordinateId: subordinate.id,
    proposedSupervisorId: proposedSupervisor?.id ?? null,
  }));
}

export function isInvalidItemsError(
  error: unknown,
): error is { status: number; data: IMentorshipDraftInvalidItemsResponse } {
  return (
    isApiErrorMessage(error) &&
    "errorCode" in error.data &&
    error.data.errorCode === EMentorshipDraftErrorCode.MENTORSHIP_DRAFT_INVALID_ITEMS
  );
}

export function toViolationMap(
  errors: IMentorshipDraftInvalidItemsResponse["errors"],
): TDraftViolations {
  return Object.fromEntries(
    errors.map(({ subordinateId, violations }) => [subordinateId, violations]),
  );
}

export function keepViolationsForUnchanged(
  violations: TDraftViolations,
  previousItems: readonly TDraftItem[],
  nextItems: readonly TDraftItem[],
): TDraftViolations {
  const unchanged = new Set(
    nextItems.filter((item) => previousItems.includes(item)).map((item) => item.subordinateId),
  );

  return Object.fromEntries(
    Object.entries(violations).filter(([subordinateId]) => unchanged.has(subordinateId)),
  );
}

export function isDraftDirty(current: TDraftSnapshot, saved: TDraftSnapshot | null): boolean {
  if (!saved) {
    return current.items.length > 0 || current.title.trim().length > 0;
  }

  return (
    current.title.trim() !== saved.title ||
    JSON.stringify(current.items) !== JSON.stringify(saved.items)
  );
}
