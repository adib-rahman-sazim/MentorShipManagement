import projectApi from "@/shared/redux/rtk-apis/api.config";
import { IMentorshipGraphResponse, IMyMentorshipResponse, TApiResponse } from "@/shared/typedefs";

const mentorshipsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyMentorship: builder.query<IMyMentorshipResponse, void>({
      query: () => "mentorships/me",
      transformResponse: (response: TApiResponse<IMyMentorshipResponse>) => response.data,
      providesTags: ["MyMentorship"],
    }),

    getMentorshipGraph: builder.query<IMentorshipGraphResponse, void>({
      query: () => "mentorships/graph",
      transformResponse: (response: TApiResponse<IMentorshipGraphResponse>) => response.data,
      providesTags: ["MentorshipGraph"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyMentorshipQuery, useGetMentorshipGraphQuery } = mentorshipsApi;
