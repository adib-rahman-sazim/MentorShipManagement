import { useEffect, useState } from "react";

import type { TGraphSelection } from "@/modules/graph/graph.types";

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
