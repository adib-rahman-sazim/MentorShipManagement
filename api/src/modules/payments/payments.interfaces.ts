import type { RawBodyRequest } from "@nestjs/common";

import type {
  EPaymentCurrency,
  EPaymentProvider,
  EPaymentType,
  EPaymentWebhookEvent,
} from "@/common/enums/payments.enums";
import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";
import type { TMaybePromise } from "@/common/types/utils.types";

import type { CreateCheckoutSessionDto, ListPaymentsQueryDto } from "./payments.dtos";

export interface ICreateCheckoutSessionContext {
  checkoutSessionDto: CreateCheckoutSessionDto;
  userData: Express.IUser;
}

export interface IListPaymentsContext {
  userId: string;
  query: ListPaymentsQueryDto;
}

export interface IHandlePaymentWebhookContext {
  request: RawBodyRequest<Request>;
}

export interface IPrice {
  id: string;
  amount: number;
  currency: EPaymentCurrency;
  recurring: null | {
    interval: string;
    intervalCount: number;
    trialPeriodDays: number | null;
  };
  product?: Omit<IProduct, "prices">;
}

export interface IProduct {
  id: string;
  name: string;
  description: string | null;
  prices: Array<Omit<IPrice, "product">>;
}

export interface IProviderSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: ESubscriptionStatus;
  currentPeriodStartAt: Date;
  currentPeriodEndAt: Date;
  cancelAtPeriodEnd: boolean;
}

export interface ICheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  quantity?: number;
  metadata?: Record<string, string | number | null>;
  userData: Pick<Express.IUser, "id" | "email">;
  customerId?: string;
}

export interface ICheckoutSessionResponse {
  provider: EPaymentProvider;
  sessionId: string;
  checkoutUrl: string;
  paymentType: EPaymentType;
  amount: number;
  currency: EPaymentCurrency;
  productId: string;
  priceId: string;
  quantity: number;
  description?: string;
  metadata?: Record<string, string | number | null>;
}

export interface IWebhookResponse {
  provider: EPaymentProvider;
  payload:
    | {
        event: EPaymentWebhookEvent.CHECKOUT_COMPLETED;
        data: {
          sessionId: string;
          clientReferenceId: string | null;
          amount: number;
          currency: EPaymentCurrency;
          subscription?: IProviderSubscription;
        };
      }
    | {
        event: EPaymentWebhookEvent.PAYMENT_SUCCEEDED;
        data: {
          subscriptionId: string;
          invoiceId: string;
          amount: number;
          currency: EPaymentCurrency;
          description: string;
          productId: string;
          priceId: string;
          quantity: number;
          metadata?: Record<string, string | number | null>;
        };
      }
    | {
        event: EPaymentWebhookEvent.SUBSCRIPTION_UPDATED;
        data: IProviderSubscription;
      }
    | {
        event: EPaymentWebhookEvent.CHECKOUT_EXPIRED;
        data: { sessionId: string };
      }
    | {
        event: EPaymentWebhookEvent.UNHANDLED;
      };
}

export interface IPaymentProvider {
  readonly provider: EPaymentProvider;
  createCheckoutSession(request: ICheckoutSessionRequest): Promise<ICheckoutSessionResponse>;
  getPriceList(): Promise<IPrice[]>;
  getPriceById(priceId: string): Promise<IPrice>;
  cancelSubscription(subscriptionId: string): Promise<IProviderSubscription>;
  resumeSubscription(subscriptionId: string): Promise<IProviderSubscription>;
  handleWebhook(request: RawBodyRequest<Request>): TMaybePromise<IWebhookResponse>;
}
