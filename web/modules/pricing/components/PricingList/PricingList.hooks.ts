import { useEffect, useState } from "react";

import Router, { useRouter } from "next/router";

import { toast } from "sonner";

import {
  CANCELED_STATUS,
  MESSAGES,
  STATUS_QUERY_PARAM,
  SUCCESS_STATUS,
} from "@/modules/pricing/components/PricingList/PricingList.constants";
import { getCheckoutRedirectUrls } from "@/modules/pricing/components/PricingList/PricingList.helpers";
import { BILLING_ROUTE, PRICING_ROUTE } from "@/shared/constants/routes.constants";
import { useAppDispatch } from "@/shared/redux/hooks";
import projectApi from "@/shared/redux/rtk-apis/api.config";
import {
  useGetPriceListQuery,
  useRequestCheckoutUrlMutation,
} from "@/shared/redux/rtk-apis/payments/payments.api";
import { parseApiErrorMessage } from "@/shared/utils/errors";

export const usePricing = () => {
  const { data: priceListResponse, isLoading } = useGetPriceListQuery(undefined);
  const [getCheckoutUrl, { isLoading: isCheckoutLoading }] = useRequestCheckoutUrlMutation();
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const paymentStatus = router.query[STATUS_QUERY_PARAM] as string | undefined;

  useEffect(() => {
    if (paymentStatus === SUCCESS_STATUS) {
      toast.success(MESSAGES.PAYMENT_SUCCESS);
      dispatch(projectApi.util.invalidateTags(["Payments", "Subscriptions"]));
      Router.replace(BILLING_ROUTE);
    } else if (paymentStatus === CANCELED_STATUS) {
      toast.error(MESSAGES.PAYMENT_CANCELED);
      Router.replace(PRICING_ROUTE, undefined, { shallow: true });
    }
  }, [dispatch, paymentStatus]);

  const handlePay = async (priceId: string) => {
    if (isCheckoutLoading || checkoutPriceId) {
      return;
    }

    try {
      setCheckoutPriceId(priceId);
      const { cancelUrl, successUrl } = getCheckoutRedirectUrls(window.location.origin);
      const response = await getCheckoutUrl({
        priceId,
        successUrl,
        cancelUrl,
      }).unwrap();

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setCheckoutPriceId(null);
      }
    } catch (error) {
      toast.error(MESSAGES.INITIATE_CHECKOUT_ERROR, {
        description: parseApiErrorMessage(error),
      });
      setCheckoutPriceId(null);
    }
  };

  return {
    checkoutPriceId,
    priceList: priceListResponse?.data ?? [],
    isLoading,
    handlePay,
  };
};
