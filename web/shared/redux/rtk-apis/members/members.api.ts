import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import { IUpdateMemberRoleDto, IUpdateSystemRolesDto } from "./members.interfaces";

const membersApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    updateMemberRole: builder.mutation<{ success: boolean; message: string }, IUpdateMemberRoleDto>(
      {
        query: (data) => ({
          url: "members",
          method: "PATCH",
          body: data,
        }),
        transformResponse: (response: TApiResponse<{ success: boolean; message: string }>) =>
          response.data,
        invalidatesTags: ["Roles", "Users", { type: "Users", id: "LIST" }],
      },
    ),
    updateSystemRoles: builder.mutation<
      { success: boolean; message: string },
      IUpdateSystemRolesDto
    >({
      query: (data) => ({
        url: "members/system-roles",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: TApiResponse<{ success: boolean; message: string }>) =>
        response.data,
      invalidatesTags: ["Roles", "Users", { type: "Users", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useUpdateMemberRoleMutation, useUpdateSystemRolesMutation } = membersApi;
