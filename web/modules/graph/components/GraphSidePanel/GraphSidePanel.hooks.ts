import { useEffect, useState } from "react";

import type { TGraphSelection } from "@/modules/graph/graph.types";

import { NON_MODAL_BODY_POINTER_EVENTS } from "./GraphSidePanel.constants";

export const useDisplayedSelection = (selection: TGraphSelection | null) => {
  const [lastSelection, setLastSelection] = useState(selection);
  const kind = selection?.kind;
  const id = selection?.id;

  useEffect(() => {
    if (kind && id) {
      setLastSelection({ kind, id });
    }
  }, [kind, id]);

  return selection ?? lastSelection;
};

export const useNonModalSheetBody = (isSheetOpen: boolean) => {
  useEffect(() => {
    if (!isSheetOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.body.style.pointerEvents = NON_MODAL_BODY_POINTER_EVENTS;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isSheetOpen]);
};
