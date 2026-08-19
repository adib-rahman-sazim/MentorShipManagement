import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import {
  ICreateOrganizationDto,
  IListOrganizationMembersParams,
  IListOrganizationsParams,
  IOrganizationResponse,
  IPaginatedOrganizationMembersResponse,
  IPaginatedOrganizationsResponse,
} from "./organizations.interfaces";

const organizationsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<
      IPaginatedOrganizationsResponse,
      IListOrganizationsParams | void
    >({
      query: (params) => ({
        url: "organizations",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: TApiResponse<IPaginatedOrganizationsResponse>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Organizations" as const, id })),
              { type: "Organizations" as const, id: "LIST" },
            ]
          : [{ type: "Organizations" as const, id: "LIST" }],
    }),

    createOrganization: builder.mutation<IOrganizationResponse, ICreateOrganizationDto>({
      query: (body) => ({
        url: "organizations",
        method: "POST",
        body,
      }),
      transformResponse: (response: TApiResponse<IOrganizationResponse>) => response.data,
      invalidatesTags: [{ type: "Organizations", id: "LIST" }],
    }),

    getOrganizationMembers: builder.query<
      IPaginatedOrganizationMembersResponse,
      IListOrganizationMembersParams
    >({
      query: ({ organizationId, page, limit }) => ({
        url: `organizations/${organizationId}/members`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response: TApiResponse<IPaginatedOrganizationMembersResponse>) =>
        response.data,
      providesTags: (_result, _error, { organizationId }) => [
        { type: "OrganizationMembers", id: organizationId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useGetOrganizationMembersQuery,
} = organizationsApi;
