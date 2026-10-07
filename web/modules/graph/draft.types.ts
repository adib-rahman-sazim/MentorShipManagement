import type { Connection, Edge } from "@xyflow/react";

import type { TAppAbility } from "@/shared/providers/AbilityProvider/AbilityProvider.types";
import {
  EMentorshipDraftOperation,
  EMentorshipViolation,
  IMentorshipGraphNodeResponse,
  IMentorshipGraphResponse,
} from "@/shared/typedefs";

import { EDraftNoticeKind } from "./draft.enums";

export type TDraftItem = {
  operation: EMentorshipDraftOperation;
  subordinateId: string;
  proposedSupervisorId: string | null;
};

export type TDraftViolations = Record<string, EMentorshipViolation[]>;

export type TGraphIndex = {
  peopleById: ReadonlyMap<string, IMentorshipGraphNodeResponse>;
  liveSupervisorById: ReadonlyMap<string, string>;
};

export type TDraftConnection = Pick<Connection, "source" | "target">;

export type TConnectionCheck = {
  ok: boolean;
  reason: string | null;
};

export type TDraftContext = {
  index: TGraphIndex;
  items: TDraftItem[];
  ability: TAppAbility;
};

export type TConnectionContext = TDraftContext & {
  movingSubordinateId: string | null;
};

export type TDraftUpdate = {
  items: TDraftItem[];
  reason: string | null;
};

export type TDraftEdgeData = {
  operation: EMentorshipDraftOperation | null;
  isProposed: boolean;
};

export type TDraftEdge = Edge<TDraftEdgeData>;

export type TDraftOperationDetails = {
  word: string;
  glyph: string;
  textClassName: string;
  badgeClassName: string;
};

export type TPersonDraftState = {
  operation: EMentorshipDraftOperation | null;
  hasViolation: boolean;
  isTargetConnectable: boolean;
  isSourceConnectable: boolean;
  isStale?: boolean;
};

export type TDraftChange = {
  subordinateId: string;
  operation: EMentorshipDraftOperation;
  name: string;
  roleLabel: string;
  fromName: string;
  toName: string;
  sentence: string;
  violations: string[];
};

export type TDraftNotice = {
  kind: EDraftNoticeKind;
  subordinateId: string;
  operation: EMentorshipDraftOperation | null;
  text: string;
};

export type TDraftNoticeContext = TDraftContext & {
  graph: IMentorshipGraphResponse;
};

export type TDraftSnapshot = {
  title: string;
  items: TDraftItem[];
};

export type TOperationCounts = Record<EMentorshipDraftOperation, number>;
