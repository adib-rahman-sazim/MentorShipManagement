import { TApiResponse } from "@/shared/typedefs";

import projectApi from "../api.config";
import {
  ICreateInvitationDto,
  ICreateInvitationResultResponse,
  IInvitationResponse,
  IListInvitationsParams,
  IOrganizationInvitationValidationResponse,
  IPaginatedInvitationsResponse,
  ISystemInvitationValidationResponse,
  IValidateOrganizationInvitationParams,
  IValidateSystemInvitationParams,
} from "./invitations.interfaces";

const invitationsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvitations: builder.query<IPaginatedInvitationsResponse, IListInvitationsParams | void>({
      query: (params) => ({
        url: "invitations",
        method: "GET",
        params: params ?? undefined,
      }),
      transformResponse: (response: TApiResponse<IPaginatedInvitationsResponse>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Invitations" as const, id })),
              { type: "Invitations" as const, id: "LIST" },
            ]
          : [{ type: "Invitations" as const, id: "LIST" }],
    }),

    createInvitation: builder.mutation<ICreateInvitationResultResponse, ICreateInvitationDto>({
      query: (body) => ({
        url: "invitations",
        method: "POST",
        body,
      }),
      transformResponse: (response: TApiResponse<ICreateInvitationResultResponse>) => response.data,
      invalidatesTags: [
        { type: "Invitations", id: "LIST" },
        { type: "Users", id: "LIST" },
      ],
    }),

    resendInvitation: builder.mutation<ICreateInvitationResultResponse, string>({
      query: (invitationId) => ({
        url: `invitations/${invitationId}/resend`,
        method: "POST",
      }),
      transformResponse: (response: TApiResponse<ICreateInvitationResultResponse>) => response.data,
      invalidatesTags: [{ type: "Invitations", id: "LIST" }],
    }),

    cancelInvitation: builder.mutation<IInvitationResponse, string>({
      query: (invitationId) => ({
        url: `invitations/${invitationId}`,
        method: "DELETE",
      }),
      transformResponse: (response: TApiResponse<IInvitationResponse>) => response.data,
      invalidatesTags: (result) => [
        { type: "Invitations" as const, id: result?.id },
        { type: "Invitations" as const, id: "LIST" },
      ],
    }),

    getMyPendingInvitations: builder.query<IInvitationResponse[], void>({
      query: () => ({
        url: "invitations/my-pending",
        method: "GET",
      }),
      transformResponse: (response: TApiResponse<IInvitationResponse[]>) => response.data,
      providesTags: [{ type: "Invitations", id: "MY_PENDING" }],
    }),

    getSystemInvitation: builder.query<
      ISystemInvitationValidationResponse,
      IValidateSystemInvitationParams
    >({
      query: (params) => ({
        url: "invitations/system/validate",
        method: "GET",
        params,
      }),
      transformResponse: (response: TApiResponse<ISystemInvitationValidationResponse>) =>
        response.data,
    }),

    getOrganizationInvitation: builder.query<
      IOrganizationInvitationValidationResponse,
      IValidateOrganizationInvitationParams
    >({
      query: (params) => ({
        url: "invitations/organization/validate",
        method: "GET",
        params,
      }),
      transformResponse: (response: TApiResponse<IOrganizationInvitationValidationResponse>) =>
        response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInvitationsQuery,
  useLazyGetInvitationsQuery,
  useCreateInvitationMutation,
  useResendInvitationMutation,
  useCancelInvitationMutation,
  useGetMyPendingInvitationsQuery,
  useLazyGetMyPendingInvitationsQuery,
  useGetSystemInvitationQuery,
  useLazyGetOrganizationInvitationQuery,
  useGetOrganizationInvitationQuery,
} = invitationsApi;
