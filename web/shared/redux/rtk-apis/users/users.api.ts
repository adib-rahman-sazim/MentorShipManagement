import { TApiResponse, TPaginationMetadata } from "@/shared/typedefs";

import projectApi from "../api.config";
import {
  IBackendPaginationMeta,
  IInviteUserDto,
  IListUsersParams,
  IPaginatedUsersResponse,
  IUpdateUserDto,
  IUserResponse,
} from "./users.interfaces";

const transformPaginationMeta = (meta: IBackendPaginationMeta): TPaginationMetadata => ({
  currentPage: meta.page,
  itemsPerPage: meta.limit,
  totalItems: meta.total,
  totalPages: meta.totalPages,
  hasNextPage: meta.page < meta.totalPages,
  hasPreviousPage: meta.page > 1,
});

const usersApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<IUserResponse, void>({
      query: () => "users/me",
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      providesTags: ["UserProfile"],
    }),

    getUsers: builder.query<IPaginatedUsersResponse, IListUsersParams>({
      query: (params) => ({
        url: "users",
        method: "GET",
        params,
      }),
      transformResponse: (
        response: TApiResponse<{ data: IUserResponse[]; meta: IBackendPaginationMeta }>,
      ): IPaginatedUsersResponse => ({
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

    updateUser: builder.mutation<IUserResponse, IUpdateUserDto & { id: string }>({
      query: ({ id, ...data }) => ({
        url: `users/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: TApiResponse<IUserResponse>) => response.data,
      invalidatesTags: (result) => [
        { type: "User" as const, id: result?.id },
        { type: "Users" as const, id: "LIST" },
      ],
    }),

    inviteUser: builder.mutation<{ success: boolean; message: string }, IInviteUserDto>({
      query: (data) => ({
        url: "users",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: TApiResponse<{ success: boolean; message: string }>) =>
        response.data,
      invalidatesTags: [{ type: "Users" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useInviteUserMutation,
} = usersApi;
