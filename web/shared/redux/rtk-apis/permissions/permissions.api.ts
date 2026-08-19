import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import { CASL_CACHE_TTL_SECONDS } from "./permissions.constants";
import { IMyCaslRulesResponse } from "./permissions.interfaces";

const permissionsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPermissions: builder.query<IMyCaslRulesResponse, string>({
      // Custom cache key argument; RTK uses it for cache identity only.
      query: (_cacheKey) => "permissions/my",
      transformResponse: (response: TApiResponse<IMyCaslRulesResponse>) => response.data,
      providesTags: ["Permissions"],
      keepUnusedDataFor: CASL_CACHE_TTL_SECONDS,
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyPermissionsQuery } = permissionsApi;
