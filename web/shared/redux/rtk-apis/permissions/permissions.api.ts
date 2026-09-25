import { IUserPermissionOverridesResponse, TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import { CASL_CACHE_TTL_SECONDS } from "./permissions.constants";
import { IMyCaslRulesResponse } from "./permissions.interfaces";
import { TReplaceUserPermissionOverridesArgs } from "./permissions.types";

const permissionsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPermissions: builder.query<IMyCaslRulesResponse, string>({
      // Custom cache key argument; RTK uses it for cache identity only.
      query: (_cacheKey) => "permissions/my",
      transformResponse: (response: TApiResponse<IMyCaslRulesResponse>) => response.data,
      providesTags: ["Permissions"],
      keepUnusedDataFor: CASL_CACHE_TTL_SECONDS,
    }),

    getUserPermissionOverrides: builder.query<IUserPermissionOverridesResponse, string>({
      query: (userId) => `permissions/users/${userId}/overrides`,
      transformResponse: (response: TApiResponse<IUserPermissionOverridesResponse>) =>
        response.data,
      providesTags: (_result, _error, userId) => [{ type: "UserPermissions" as const, id: userId }],
    }),

    replaceUserPermissionOverrides: builder.mutation<
      IUserPermissionOverridesResponse,
      TReplaceUserPermissionOverridesArgs
    >({
      query: ({ userId, ...body }) => ({
        url: `permissions/users/${userId}/overrides`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: TApiResponse<IUserPermissionOverridesResponse>) =>
        response.data,
      async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
        const saved = await queryFulfilled.catch(() => null);

        if (saved) {
          dispatch(
            permissionsApi.util.upsertQueryData("getUserPermissionOverrides", userId, saved.data),
          );
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyPermissionsQuery,
  useGetUserPermissionOverridesQuery,
  useReplaceUserPermissionOverridesMutation,
} = permissionsApi;
