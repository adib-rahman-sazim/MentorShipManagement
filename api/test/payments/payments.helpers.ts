import { BadRequestException } from "@nestjs/common";

import type { EntityManager } from "@mikro-orm/core";

import dayjs from "dayjs";
import { mockDeep } from "vitest-mock-extended";

import { Payment } from "@/common/entities/payments.entity";
import { Subscription } from "@/common/entities/subscriptions.entity";
import type { User } from "@/common/entities/users.entity";
import {
  EPaymentCurrency,
  EPaymentProvider,
  EPaymentStatus,
  EPaymentType,
  EPaymentWebhookEvent,
} from "@/common/enums/payments.enums";
import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";
import type {
  IPaymentProvider,
  IProviderSubscription,
  IWebhookResponse,
} from "@/modules/payments/payments.interfaces";

import {
  TEST_ONE_TIME_PRICE_ID,
  TEST_ONE_TIME_PRODUCT_ID,
  TEST_PERIOD_IN_MILLISECONDS,
  TEST_PRO_PRICE_ID,
  TEST_PRO_PRODUCT_ID,
  TEST_RECURRING_PRICE_ID,
  TEST_RECURRING_PRODUCT_ID,
} from "./payments.constants";

export {
  TEST_CHECKOUT_URLS,
  TEST_ONE_TIME_PRICE_ID,
  TEST_PRO_PRICE_ID,
  TEST_RECURRING_PRICE_ID,
} from "./payments.constants";

export const getMockPaymentProvider = () => {
  const mockService = mockDeep<IPaymentProvider>({ funcPropSupport: true });

  const priceList = [
    {
      id: TEST_RECURRING_PRICE_ID,
      amount: 999,
      currency: EPaymentCurrency.USD,
      product: {
        id: TEST_RECURRING_PRODUCT_ID,
        name: "Starter Plan",
        description: "Perfect for getting started",
      },
      recurring: {
        interval: "month",
        intervalCount: 1,
        trialPeriodDays: 7,
      },
    },
    {
      id: TEST_PRO_PRICE_ID,
      amount: 2999,
      currency: EPaymentCurrency.USD,
      product: {
        id: TEST_PRO_PRODUCT_ID,
        name: "Pro Plan",
        description: "Advanced features",
      },
      recurring: {
        interval: "month",
        intervalCount: 1,
        trialPeriodDays: 14,
      },
    },
    {
      id: TEST_ONE_TIME_PRICE_ID,
      amount: 4999,
      currency: EPaymentCurrency.USD,
      product: {
        id: TEST_ONE_TIME_PRODUCT_ID,
        name: "One-Time Purchase",
        description: null,
      },
      recurring: null,
    },
  ];

  mockService.getPriceList.mockResolvedValue(priceList);

  mockService.getPriceById.mockImplementation(async (priceId) => {
    const price = priceList.find((p) => p.id === priceId);
    if (!price) {
      throw new BadRequestException("Price not found");
    }
    return price;
  });

  mockService.createCheckoutSession.mockImplementation(async (request) => {
    const price = await mockService.getPriceById(request.priceId);

    return {
      provider: EPaymentProvider.STRIPE,
      sessionId: `session_${Date.now()}`,
      checkoutUrl: `https://checkout.stripe.com/session_${Date.now()}`,
      paymentType: price.recurring ? EPaymentType.RECURRING : EPaymentType.ONE_OFF,
      amount: price.amount,
      currency: price.currency,
      productId: price.product!.id,
      priceId: request.priceId,
      quantity: request.quantity ?? 1,
      description: price.product!.name,
    };
  });

  mockService.handleWebhook.mockImplementation((request) => ({
    provider: EPaymentProvider.STRIPE,
    payload: getWebhookPayload(request.body as unknown as IWebhookResponse["payload"]),
  }));

  mockService.cancelSubscription.mockImplementation((subscriptionId) =>
    Promise.resolve(createProviderSubscriptionPayload(subscriptionId, true)),
  );
  mockService.resumeSubscription.mockImplementation((subscriptionId) =>
    Promise.resolve(createProviderSubscriptionPayload(subscriptionId, false)),
  );

  return mockService;
};

const createProviderSubscriptionPayload = (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean,
): IProviderSubscription => ({
  id: subscriptionId,
  customerId: `cus_${subscriptionId}`,
  priceId: TEST_RECURRING_PRICE_ID,
  status: ESubscriptionStatus.ACTIVE,
  currentPeriodStartAt: dayjs().toDate(),
  currentPeriodEndAt: dayjs().add(TEST_PERIOD_IN_MILLISECONDS, "millisecond").toDate(),
  cancelAtPeriodEnd,
});

const getProviderSubscriptionPayload = (
  subscription: IProviderSubscription,
): IProviderSubscription => ({
  ...subscription,
  currentPeriodStartAt: dayjs(subscription.currentPeriodStartAt).toDate(),
  currentPeriodEndAt: dayjs(subscription.currentPeriodEndAt).toDate(),
});

const getWebhookPayload = (payload: IWebhookResponse["payload"]): IWebhookResponse["payload"] => {
  switch (payload.event) {
    case EPaymentWebhookEvent.CHECKOUT_COMPLETED:
      return payload.data.subscription
        ? {
            ...payload,
            data: {
              ...payload.data,
              subscription: getProviderSubscriptionPayload(payload.data.subscription),
            },
          }
        : payload;
    case EPaymentWebhookEvent.SUBSCRIPTION_UPDATED:
      return {
        ...payload,
        data: getProviderSubscriptionPayload(payload.data),
      };
    default:
      return payload;
  }
};

export const createMockCheckoutCompletedPayload = (overrides?: {
  sessionId?: string;
  amount?: number;
  subscriptionId?: string;
}) => ({
  event: EPaymentWebhookEvent.CHECKOUT_COMPLETED,
  data: {
    sessionId: overrides?.sessionId ?? `session_${Date.now()}`,
    clientReferenceId: null,
    amount: overrides?.amount ?? 999,
    currency: EPaymentCurrency.USD,
    subscription: {
      id: overrides?.subscriptionId ?? `sub_${Date.now()}`,
      customerId: `cus_${Date.now()}`,
      priceId: TEST_RECURRING_PRICE_ID,
      status: ESubscriptionStatus.ACTIVE,
      currentPeriodStartAt: dayjs().toDate(),
      currentPeriodEndAt: dayjs().add(TEST_PERIOD_IN_MILLISECONDS, "millisecond").toDate(),
      cancelAtPeriodEnd: false,
    },
  },
});

export const createMockOneOffCheckoutCompletedPayload = (overrides?: {
  sessionId?: string;
  amount?: number;
}) => ({
  event: EPaymentWebhookEvent.CHECKOUT_COMPLETED,
  data: {
    sessionId: overrides?.sessionId ?? `session_${Date.now()}`,
    clientReferenceId: null,
    amount: overrides?.amount ?? 4999,
    currency: EPaymentCurrency.USD,
  },
});

export const createMockPaymentSucceededPayload = (overrides?: {
  subscriptionId?: string;
  invoiceId?: string;
}) => ({
  event: EPaymentWebhookEvent.PAYMENT_SUCCEEDED,
  data: {
    subscriptionId: overrides?.subscriptionId ?? `sub_${Date.now()}`,
    invoiceId: overrides?.invoiceId ?? `invoice_${Date.now()}`,
    amount: 999,
    currency: EPaymentCurrency.USD,
    description: "Starter Plan",
    productId: TEST_RECURRING_PRODUCT_ID,
    priceId: TEST_RECURRING_PRICE_ID,
    quantity: 1,
    metadata: {},
  },
});

export const createMockSubscriptionUpdatedPayload = (overrides?: {
  subscriptionId?: string;
  status?: ESubscriptionStatus;
}) => ({
  event: EPaymentWebhookEvent.SUBSCRIPTION_UPDATED,
  data: {
    id: overrides?.subscriptionId ?? `sub_${Date.now()}`,
    customerId: `cus_${Date.now()}`,
    priceId: TEST_RECURRING_PRICE_ID,
    status: overrides?.status ?? ESubscriptionStatus.ACTIVE,
    currentPeriodStartAt: dayjs().toDate(),
    currentPeriodEndAt: dayjs().add(TEST_PERIOD_IN_MILLISECONDS, "millisecond").toDate(),
    cancelAtPeriodEnd: false,
  },
});

export const createMockCheckoutExpiredPayload = (overrides?: { sessionId?: string }) => ({
  event: EPaymentWebhookEvent.CHECKOUT_EXPIRED,
  data: {
    sessionId: overrides?.sessionId ?? `session_${Date.now()}`,
  },
});

export const createPaymentInDb = (
  dbService: EntityManager,
  user: User,
  overrides?: Partial<Payment>,
): Payment =>
  dbService.create(Payment, {
    externalId: `ext_${Date.now()}_${Math.random()}`,
    type: EPaymentType.RECURRING,
    status: EPaymentStatus.SUCCEEDED,
    priceId: TEST_RECURRING_PRICE_ID,
    productId: TEST_RECURRING_PRODUCT_ID,
    quantity: 1,
    amount: 999,
    currency: EPaymentCurrency.USD,
    description: "Starter Plan",
    provider: EPaymentProvider.STRIPE,
    user,
    ...overrides,
  });

export const createSubscriptionInDb = (
  dbService: EntityManager,
  user: User,
  overrides?: Partial<Subscription>,
): Subscription =>
  dbService.create(Subscription, {
    providerSubscriptionId: `sub_${Date.now()}_${Math.random()}`,
    customerId: `cus_${Date.now()}_${Math.random()}`,
    priceId: TEST_RECURRING_PRICE_ID,
    status: ESubscriptionStatus.ACTIVE,
    currentPeriodStartAt: dayjs().toDate(),
    currentPeriodEndAt: dayjs().add(TEST_PERIOD_IN_MILLISECONDS, "millisecond").toDate(),
    cancelAtPeriodEnd: false,
    user,
    ...overrides,
  });
