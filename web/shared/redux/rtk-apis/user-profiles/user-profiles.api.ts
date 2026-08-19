import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import { ICurrentUserProfileResponse, IUpdateProfileDto } from "./user-profiles.interfaces";

const userProfileApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<ICurrentUserProfileResponse, void>({
      query: () => "users/me",
      transformResponse: (response: TApiResponse<ICurrentUserProfileResponse>) => response.data,
      providesTags: ["UserProfile"],
    }),

    updateUserProfile: builder.mutation<ICurrentUserProfileResponse, IUpdateProfileDto>({
      query: (body) => ({
        url: "users/me",
        method: "PATCH",
        body,
      }),
      transformResponse: (response: TApiResponse<ICurrentUserProfileResponse>) => response.data,
      invalidatesTags: ["UserProfile"],
    }),
  }),

  overrideExisting: false,
});

export const { useGetUserProfileQuery, useUpdateUserProfileMutation } = userProfileApi;
