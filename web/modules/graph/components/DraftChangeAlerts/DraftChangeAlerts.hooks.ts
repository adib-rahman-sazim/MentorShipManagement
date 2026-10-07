import { skipToken } from "@reduxjs/toolkit/query";

import { useGetMentorshipDraftQuery } from "@/shared/redux/rtk-apis/mentorship-drafts/mentorship-drafts.api";

export const useChangedByDraft = (draftId: string | null) =>
  useGetMentorshipDraftQuery(draftId ?? skipToken).currentData;
