import type {
  IsValidConnection,
  OnBeforeDelete,
  OnConnect,
  OnConnectEnd,
  OnReconnect,
  ReactFlowProps,
} from "@xyflow/react";

import { EMentorshipDraftStatus } from "@/shared/typedefs";

import type { TDraftContext, TDraftEdge, TDraftItem, TDraftViolations } from "./draft.types";
import type { TGraphNode } from "./graph.types";

export interface IGraphDraft {
  isActive: boolean;
  canCreateDraft: boolean;
  isEditable: boolean;
  status: EMentorshipDraftStatus;
  title: string;
  items: TDraftItem[];
  violations: TDraftViolations;
  isDirty: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  isChangesSheetOpen: boolean;
  setTitle: (title: string) => void;
  changeItems: (items: TDraftItem[]) => void;
  startNewDraft: () => void;
  exitDraft: () => void;
  save: () => Promise<void>;
  submit: () => Promise<void>;
  openChangesSheet: () => void;
  closeChangesSheet: () => void;
}

export interface IDraftCanvasHandlers {
  context: TDraftContext;
  movingSubordinateId: string | null;
  isValidConnection: IsValidConnection<TDraftEdge>;
  onConnect: OnConnect;
  onConnectEnd: OnConnectEnd;
  onReconnectStart: ReactFlowProps<TGraphNode, TDraftEdge>["onReconnectStart"];
  onReconnect: OnReconnect<TDraftEdge>;
  onReconnectEnd: ReactFlowProps<TGraphNode, TDraftEdge>["onReconnectEnd"];
  onBeforeDelete: OnBeforeDelete<TGraphNode, TDraftEdge>;
}
