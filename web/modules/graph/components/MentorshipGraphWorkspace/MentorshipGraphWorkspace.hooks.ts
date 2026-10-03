import { useCallback, useEffect, useRef, useState } from "react";

import { OnSelectionChangeParams, useReactFlow, useStoreApi } from "@xyflow/react";
import { useQueryStates } from "nuqs";

import { GRAPH_SELECTION_PARSERS } from "@/modules/graph/graph.constants";
import { getGraphSelection, getPersonCenter, isPersonInView } from "@/modules/graph/graph.helpers";

import {
  CLEAR_SELECTION_KEY,
  GRAPH_CENTER_DURATION_MS,
  GRAPH_COMPACT_MEDIA_QUERY,
} from "./MentorshipGraphWorkspace.constants";

export const useGraphSelection = () => {
  const [{ person, link }, setSelection] = useQueryStates(GRAPH_SELECTION_PARSERS);
  const { getNode, getViewport, setCenter } = useReactFlow();
  const store = useStoreApi();
  const latestRef = useRef({ person, link, setSelection });

  useEffect(() => {
    latestRef.current = { person, link, setSelection };
  });

  const clearSelection = useCallback(() => {
    setSelection({ person: null, link: null });
  }, [setSelection]);

  const handleSelectionChange = useCallback(({ nodes, edges }: OnSelectionChangeParams) => {
    const personId = nodes[0]?.id ?? null;
    const linkId = personId ? null : (edges[0]?.id ?? null);
    const {
      person: currentPersonId,
      link: currentLinkId,
      setSelection: select,
    } = latestRef.current;

    if (personId !== currentPersonId || linkId !== currentLinkId) {
      select({ person: personId, link: linkId });
    }
  }, []);

  const centerPerson = useCallback(
    (personId: string) => {
      const node = getNode(personId);

      if (node) {
        const { x, y } = getPersonCenter(node.position);
        setCenter(x, y, { zoom: getViewport().zoom, duration: GRAPH_CENTER_DURATION_MS });
      }
    },
    [getNode, getViewport, setCenter],
  );

  const focusPerson = useCallback(
    (personId: string) => {
      setSelection({ person: personId, link: null });
      centerPerson(personId);
    },
    [setSelection, centerPerson],
  );

  const revealSelectedPerson = useCallback(() => {
    const node = person ? getNode(person) : undefined;
    const { width, height } = store.getState();

    if (node && !isPersonInView(node.position, getViewport(), width, height)) {
      centerPerson(node.id);
    }
  }, [person, getNode, getViewport, store, centerPerson]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === CLEAR_SELECTION_KEY) {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  return {
    selection: getGraphSelection(person, link),
    selectedPersonId: person,
    selectedLinkId: link,
    handleSelectionChange,
    focusPerson,
    revealSelectedPerson,
    clearSelection,
  };
};

export const useIsCompactGraph = () => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(GRAPH_COMPACT_MEDIA_QUERY);
    const handleChange = () => setIsCompact(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isCompact;
};
