import {
  ICreateUserDto,
  IListUsersParams,
  IPaginatedUsersResponse,
  IUserResponse,
  TApiResponse,
  TPaginatedResponse,
} from "@/shared/typedefs";

import projectApi from "../api.config";
import { transformPaginationMeta } from "./users.helpers";
import { TUpdateUserArgs } from "./users.types";

const usersApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<IUserResponse, void>({
      query: () => "users/me",
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      providesTags: ["UserProfile"],
    }),

    getUsers: builder.query<TPaginatedResponse<IUserResponse>, IListUsersParams>({
      query: (params) => ({
        url: "users",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: TApiResponse<IPaginatedUsersResponse>,
      ): TPaginatedResponse<IUserResponse> => ({
        data: response.data.data,
        meta: transformPaginationMeta(response.data.meta),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    getUser: builder.query<IUserResponse, string>({
      query: (id) => `users/${id}`,
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "User" as const, id }],
    }),

    createUser: builder.mutation<IUserResponse, ICreateUserDto>({
      query: (body) => ({
        url: "users",
        method: "POST",
        body,
      }),
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      invalidatesTags: [{ type: "Users" as const, id: "LIST" }],
    }),

    updateUser: builder.mutation<IUserResponse, TUpdateUserArgs>({
      query: ({ id, ...body }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      invalidatesTags: (result) => [
        { type: "User" as const, id: result?.id },
        { type: "Users" as const, id: "LIST" },
        { type: "UserPermissions" as const, id: result?.id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = usersApi;