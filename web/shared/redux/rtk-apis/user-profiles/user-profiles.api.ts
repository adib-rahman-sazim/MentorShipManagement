import { IUpdateProfileDto, IUserResponse, TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";

const userProfileApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<IUserResponse, void>({
      query: () => "users/me",
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      providesTags: ["UserProfile"],
    }),

    updateUserProfile: builder.mutation<IUserResponse, IUpdateProfileDto>({
      query: (body) => ({
        url: "users/me",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      invalidatesTags: ["UserProfile"],
    }),
  }),

  overrideExisting: false,
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userProfileApi;
