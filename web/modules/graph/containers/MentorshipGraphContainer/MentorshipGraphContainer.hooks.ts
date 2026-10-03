import { useEffect, useMemo, useRef, useState } from "react";

import { skipToken } from "@reduxjs/toolkit/query";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

import { DRAFT_QUERY_KEY, DRAFT_QUERY_PARSER, NEW_DRAFT_ID } from "@/modules/graph/draft.constants";
import {
  isDraftDirty,
  isInvalidItemsError,
  keepViolationsForUnchanged,
  toDraftItems,
  toViolationMap,
} from "@/modules/graph/draft.helpers";
import type { IGraphDraft } from "@/modules/graph/draft.interfaces";
import type { TDraftItem, TDraftSnapshot, TDraftViolations } from "@/modules/graph/draft.types";
import { layoutGraph } from "@/modules/graph/graph.helpers";
import { getDraftReview } from "@/modules/graph/review.helpers";
import type { TDraftReview } from "@/modules/graph/review.types";
import { useCan } from "@/shared/providers/AbilityProvider/AbilityProvider.hooks";
import {
  useCreateMentorshipDraftMutation,
  useGetMentorshipDraftChangeSummaryQuery,
  useGetMentorshipDraftQuery,
  useSubmitMentorshipDraftMutation,
  useUpdateMentorshipDraftMutation,
} from "@/shared/redux/rtk-apis/mentorship-drafts/mentorship-drafts.api";
import { useGetMentorshipGraphQuery } from "@/shared/redux/rtk-apis/mentorships/mentorships.api";
import {
  EMentorshipDraftAction,
  EMentorshipDraftStatus,
  EPermission,
  EResource,
} from "@/shared/typedefs";
import { parseApiErrorMessage } from "@/shared/utils/errors";

import { DRAFT_SAVED_MESSAGE, DRAFT_SUBMITTED_MESSAGE } from "./MentorshipGraphContainer.constants";

export const useMentorshipGraph = () => {
  const { data, error, isLoading, isFetching, refetch } = useGetMentorshipGraphQuery();

  const layout = useMemo(() => (data ? layoutGraph(data.nodes, data.edges) : undefined), [data]);

  return {
    graph: data,
    layout,
    isLoading: isLoading || (!data && isFetching),
    errorMessage: parseApiErrorMessage(error),
    refetch,
  };
};

export const useGraphDraft = (): IGraphDraft => {
  const [draftId, setDraftId] = useQueryState(DRAFT_QUERY_KEY, DRAFT_QUERY_PARSER);
  const { isAllowed: canCreateDraft } = useCan(EPermission.CREATE, EResource.DRAFT);
  const { isAllowed: canReadDrafts } = useCan(EPermission.READ, EResource.DRAFT);
  const isNew = draftId === NEW_DRAFT_ID;
  const savedId = draftId && !isNew ? draftId : null;
  const { currentData: draft, error: loadError } = useGetMentorshipDraftQuery(
    savedId ?? skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );
  const [createDraft, { isLoading: isCreating }] = useCreateMentorshipDraftMutation();
  const [updateDraft, { isLoading: isUpdating }] = useUpdateMentorshipDraftMutation();
  const [submitDraft, { isLoading: isSubmitting }] = useSubmitMentorshipDraftMutation();
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<TDraftItem[]>([]);
  const [saved, setSaved] = useState<TDraftSnapshot | null>(null);
  const [violations, setViolations] = useState<TDraftViolations>({});
  const [isChangesSheetOpen, setIsChangesSheetOpen] = useState(false);
  const loadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (draft && loadedIdRef.current !== draft.id) {
      const loadedItems = toDraftItems(draft.items);

      loadedIdRef.current = draft.id;
      setTitle(draft.title);
      setItems(loadedItems);
      setSaved({ title: draft.title, items: loadedItems });
      setViolations({});
    }
  }, [draft]);

  useEffect(() => {
    if (loadError) {
      toast.error(parseApiErrorMessage(loadError));
      setDraftId(null);
    }
  }, [loadError, setDraftId]);

  const isEditable = isNew
    ? canCreateDraft
    : (draft?.allowedActions.includes(EMentorshipDraftAction.EDIT) ?? false);
  const isDirty = isDraftDirty({ title, items }, saved);

  const resetDraft = () => {
    loadedIdRef.current = null;
    setTitle("");
    setItems([]);
    setSaved(null);
    setViolations({});
    setIsChangesSheetOpen(false);
  };

  const changeItems = (nextItems: TDraftItem[]) => {
    setViolations((current) => keepViolationsForUnchanged(current, items, nextItems));
    setItems(nextItems);
  };

  const persist = async (): Promise<string | null> => {
    const body = { title: title.trim(), items };

    try {
      const result = savedId
        ? await updateDraft({ id: savedId, ...body }).unwrap()
        : await createDraft(body).unwrap();

      loadedIdRef.current = result.id;
      setSaved(body);
      setViolations({});

      if (!savedId) {
        await setDraftId(result.id);
      }

      return result.id;
    } catch (error) {
      if (isInvalidItemsError(error)) {
        setViolations(toViolationMap(error.data.errors));
      }

      toast.error(parseApiErrorMessage(error));

      return null;
    }
  };

  const save = async () => {
    const id = await persist();

    if (id) {
      toast.success(DRAFT_SAVED_MESSAGE);
    }
  };

  const submit = async () => {
    const id = isDirty || !savedId ? await persist() : savedId;

    if (!id) {
      return;
    }

    try {
      await submitDraft(id).unwrap();
      toast.success(DRAFT_SUBMITTED_MESSAGE);
    } catch (error) {
      toast.error(parseApiErrorMessage(error));
    }
  };

  return {
    isActive: savedId !== null || (isNew && canCreateDraft),
    canCreateDraft,
    canReadDrafts,
    isEditable,
    status: draft?.status ?? EMentorshipDraftStatus.DRAFT,
    detail: savedId ? (draft ?? null) : null,
    title,
    items,
    violations,
    isDirty,
    isSaving: isCreating || isUpdating,
    isSubmitting,
    isChangesSheetOpen,
    setTitle,
    changeItems,
    startNewDraft: () => {
      resetDraft();
      setDraftId(NEW_DRAFT_ID);
    },
    openDraft: (id: string) => {
      resetDraft();
      setDraftId(id);
    },
    exitDraft: () => {
      resetDraft();
      setDraftId(null);
    },
    save,
    submit,
    openChangesSheet: () => setIsChangesSheetOpen(true),
    closeChangesSheet: () => setIsChangesSheetOpen(false),
  };
};

export const useDraftReview = ({ detail, isEditable }: IGraphDraft): TDraftReview | null => {
  const reviewId = detail && !isEditable ? detail.id : null;
  const { currentData: summary } = useGetMentorshipDraftChangeSummaryQuery(reviewId ?? skipToken, {
    refetchOnMountOrArgChange: true,
  });

  return useMemo(
    () => (detail && reviewId ? getDraftReview(detail, summary) : null),
    [detail, reviewId, summary],
  );
};
