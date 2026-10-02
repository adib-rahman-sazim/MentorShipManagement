import projectApi from "@/shared/redux/rtk-apis/api.config";
import { IMyMentorshipResponse, TApiResponse } from "@/shared/typedefs";

const mentorshipsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyMentorship: builder.query<IMyMentorshipResponse, void>({
      query: () => "mentorships/me",
      transformResponse: (response: TApiResponse<IMyMentorshipResponse>) => response.data,
      providesTags: ["MyMentorship"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyMentorshipQuery } = mentorshipsApi;
