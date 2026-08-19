import projectApi from "@/shared/redux/rtk-apis/api.config";
import {
  ICheckoutSessionResponse,
  ICreateCheckoutSessionDto,
  IGetPaymentsParams,
  IPaymentListResponse,
  IPriceListResponse,
  ISubscriptionListResponseDto,
} from "@/shared/typedefs/api";

const paymentsApi = projectApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentsList: builder.query<IPaymentListResponse, IGetPaymentsParams>({
      query: (params) => ({ url: "payments", params }),
      providesTags: ["Payments"],
    } as const),
    getSubscriptionsList: builder.query<ISubscriptionListResponseDto, void>({
      query: () => "subscriptions",
      providesTags: ["Subscriptions"],
    } as const),
    getPriceList: builder.query<IPriceListResponse, void>({
      query: () => "payments/price-list",
      providesTags: ["Prices"],
    } as const),
    requestCheckoutUrl: builder.mutation<ICheckoutSessionResponse, ICreateCheckoutSessionDto>({
      query: (body) => ({ url: "payments/checkout-session", method: "POST", body }),
      invalidatesTags: ["Payments"],
    } as const),
    cancelSubscription: builder.mutation<void, string>({
      query: (subscriptionId) => ({
        url: `subscriptions/${subscriptionId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Subscriptions"],
    } as const),
    resumeSubscription: builder.mutation<void, string>({
      query: (subscriptionId) => ({
        url: `subscriptions/${subscriptionId}/resume`,
        method: "POST",
      }),
      invalidatesTags: ["Subscriptions"],
    } as const),
  }),
  overrideExisting: false,
});

export const {
  useGetPriceListQuery,
  useRequestCheckoutUrlMutation,
  useGetPaymentsListQuery,
  useGetSubscriptionsListQuery,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
} = paymentsApi;
