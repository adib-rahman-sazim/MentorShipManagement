import projectApi from "@/shared/redux/rtk-apis/api.config";
import { transformPaginationMeta } from "@/shared/redux/rtk-apis/users/users.helpers";
import {
  ICreateMentorshipDraftDto,
  IListDraftsParams,
  IMentorshipDraftDetailResponse,
  IMentorshipDraftResponse,
  IMentorshipDraftSummaryResponse,
  IPaginatedMentorshipDraftsResponse,
  TApiResponse,
  TPaginatedResponse,
} from "@/shared/typedefs";

import { TUpdateMentorshipDraftArgs } from "./mentorship-drafts.types";

const mentorshipDraftsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getMentorshipDrafts: builder.query<
      TPaginatedResponse<IMentorshipDraftSummaryResponse>,
      IListDraftsParams
    >({
      query: (params) => ({ url: "mentorship-drafts", params }),
      transformResponse: (response: TApiResponse<IPaginatedMentorshipDraftsResponse>) => ({
        data: response.data.data,
        meta: transformPaginationMeta(response.data.meta),
      }),
      providesTags: [{ type: "MentorshipDrafts", id: "LIST" }],
    }),

    getMentorshipDraft: builder.query<IMentorshipDraftDetailResponse, string>({
      query: (id) => `mentorship-drafts/${id}`,
      transformResponse: (response: TApiResponse<IMentorshipDraftDetailResponse>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "MentorshipDraft", id }],
    }),

    createMentorshipDraft: builder.mutation<IMentorshipDraftResponse, ICreateMentorshipDraftDto>({
      query: (body) => ({ url: "mentorship-drafts", method: "POST", body }),
      transformResponse: (response: TApiResponse<IMentorshipDraftResponse>) => response.data,
      invalidatesTags: [{ type: "MentorshipDrafts", id: "LIST" }],
    }),

    updateMentorshipDraft: builder.mutation<IMentorshipDraftResponse, TUpdateMentorshipDraftArgs>({
      query: ({ id, ...body }) => ({ url: `mentorship-drafts/${id}`, method: "PATCH", body }),
      transformResponse: (response: TApiResponse<IMentorshipDraftResponse>) => response.data,
      invalidatesTags: [{ type: "MentorshipDrafts", id: "LIST" }],
    }),

    submitMentorshipDraft: builder.mutation<IMentorshipDraftDetailResponse, string>({
      query: (id) => ({ url: `mentorship-drafts/${id}/submit`, method: "POST" }),
      transformResponse: (response: TApiResponse<IMentorshipDraftDetailResponse>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "MentorshipDraft", id },
        { type: "MentorshipDrafts", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMentorshipDraftsQuery,
  useGetMentorshipDraftQuery,
  useCreateMentorshipDraftMutation,
  useUpdateMentorshipDraftMutation,
  useSubmitMentorshipDraftMutation,
} = mentorshipDraftsApi;
