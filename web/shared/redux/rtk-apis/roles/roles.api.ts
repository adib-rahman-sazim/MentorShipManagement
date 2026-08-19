import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import { EUserRole } from "./roles.enums";

const rolesApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<EUserRole[], void>({
      query: () => "roles",
      transformResponse: (response: TApiResponse<EUserRole[]>) => response.data,
      providesTags: ["Roles"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRolesQuery } = rolesApi;
